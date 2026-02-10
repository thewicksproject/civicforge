"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { GraphNode, GraphEdge } from "@/app/actions/commons";

// ---------------------------------------------------------------------------
// Force simulation types
// ---------------------------------------------------------------------------

interface SimNode extends SimulationNodeDatum, GraphNode {
  x: number;
  y: number;
  radius: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  type: GraphEdge["type"];
  weight: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function KnowledgeGraph({ nodes, edges }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: SimNode;
  } | null>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  // Measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const height = Math.min(500, Math.max(300, width * 0.6));
        setDimensions({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Initialize simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const { width, height } = dimensions;

    const sNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * width * 0.4,
      y: height / 2 + (Math.random() - 0.5) * height * 0.4,
      radius: n.size,
    }));

    const nodeMap = new Map(sNodes.map((n) => [n.id, n]));

    const sLinks: SimLink[] = edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: nodeMap.get(e.source)!,
        target: nodeMap.get(e.target)!,
        type: e.type,
        weight: e.weight,
        color: e.color,
      }));

    const sim = forceSimulation<SimNode>(sNodes)
      .force(
        "charge",
        forceManyBody<SimNode>().strength(-200)
      )
      .force("center", forceCenter(width / 2, height / 2))
      .force(
        "collision",
        forceCollide<SimNode>().radius((d) => d.radius + 10)
      )
      .force(
        "link",
        forceLink<SimNode, SimLink>(sLinks)
          .distance(120)
          .strength(0.3)
      )
      .alphaDecay(0.01)
      .velocityDecay(0.4)
      .alphaTarget(0.02) // never fully settles
      .on("tick", () => {
        // Clamp to bounds
        for (const node of sNodes) {
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
          node.y = Math.max(
            node.radius,
            Math.min(height - node.radius, node.y)
          );
        }
        setSimNodes([...sNodes]);
        setSimLinks([...sLinks]);
      });

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
  }, [nodes, edges, dimensions]);

  // Drag handlers
  const dragNode = useRef<SimNode | null>(null);

  const handleMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.preventDefault();
      const node = simNodes.find((n) => n.id === nodeId);
      if (!node || !simulationRef.current) return;

      dragNode.current = node;
      node.fx = node.x;
      node.fy = node.y;
      simulationRef.current.alphaTarget(0.1).restart();
    },
    [simNodes]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragNode.current || !svgRef.current) return;
      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      dragNode.current.fx = e.clientX - rect.left;
      dragNode.current.fy = e.clientY - rect.top;
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    if (!dragNode.current || !simulationRef.current) return;
    dragNode.current.fx = null;
    dragNode.current.fy = null;
    simulationRef.current.alphaTarget(0.02);
    dragNode.current = null;
  }, []);

  // Connected neighborhood for hover
  const connectedNodes = new Set<string>();
  if (hoveredNode) {
    connectedNodes.add(hoveredNode);
    for (const link of simLinks) {
      const src = typeof link.source === "object" ? link.source.id : String(link.source);
      const tgt = typeof link.target === "object" ? link.target.id : String(link.target);
      if (src === hoveredNode) connectedNodes.add(tgt);
      if (tgt === hoveredNode) connectedNodes.add(src);
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">
          No data available for the knowledge graph yet.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-border bg-card"
    >
      {/* Subtle background radial gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, var(--meadow-light) 0%, transparent 70%)",
          opacity: 0.08,
        }}
      />

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setHoveredNode(null);
          setTooltip(null);
        }}
      >
        <defs>
          {/* Glow filter for domain nodes */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow marker for endorsement flows */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" fillOpacity="0.5" />
          </marker>
        </defs>

        {/* Edges */}
        {simLinks.map((link, i) => {
          const src = link.source as SimNode;
          const tgt = link.target as SimNode;
          if (!src.x || !tgt.x) return null;

          const isHoverFaded =
            hoveredNode &&
            !connectedNodes.has(src.id) &&
            !connectedNodes.has(tgt.id);

          const isEndorsement = link.type === "endorsement";
          const isGuildDomain = link.type === "guild-domain";

          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={link.color}
              strokeWidth={isEndorsement ? Math.max(1.5, link.weight * 0.5) : 1.5}
              strokeOpacity={isHoverFaded ? 0.1 : isGuildDomain ? 0.3 : 0.5}
              strokeDasharray={
                isEndorsement ? "6 3" : link.type === "quest-domain" ? "2 4" : undefined
              }
              markerEnd={isEndorsement ? "url(#arrow)" : undefined}
              style={
                isEndorsement
                  ? {
                      animation: `dash-flow ${4 + i * 0.3}s linear infinite`,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* Nodes */}
        {simNodes.map((node) => {
          const isHoverFaded =
            hoveredNode && !connectedNodes.has(node.id);
          const isHovered = hoveredNode === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              opacity={isHoverFaded ? 0.2 : 1}
              style={{ transition: "opacity 0.2s ease" }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                setTooltip({ x: node.x, y: node.y, node });
              }}
              onMouseLeave={() => {
                if (!dragNode.current) {
                  setHoveredNode(null);
                  setTooltip(null);
                }
              }}
              className="cursor-pointer"
            >
              {/* Glow halo for domain nodes */}
              {node.type === "domain" && (
                <circle
                  r={node.radius + 8}
                  fill={node.color}
                  fillOpacity={0.1}
                  filter="url(#glow)"
                />
              )}

              {/* Node shape */}
              {node.type === "domain" && (
                <circle
                  r={node.radius}
                  fill={node.color}
                  fillOpacity={0.8}
                  stroke={node.color}
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={0.6}
                  style={{
                    animation: `breathe 4s ease-in-out infinite`,
                    animationDelay: `${(node.id.charCodeAt(7) ?? 0) * 0.3}s`,
                  }}
                />
              )}

              {node.type === "guild" && (
                <rect
                  x={-node.radius}
                  y={-node.radius * 0.7}
                  width={node.radius * 2}
                  height={node.radius * 1.4}
                  rx={6}
                  fill={node.color}
                  fillOpacity={0.6}
                  stroke={node.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={0.4}
                />
              )}

              {node.type === "difficulty" && (
                <polygon
                  points={`0,${-node.radius} ${node.radius},0 0,${node.radius} ${-node.radius},0`}
                  fill={node.color}
                  fillOpacity={0.7}
                  stroke={node.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={0.4}
                />
              )}

              {/* Label */}
              <text
                y={
                  node.type === "guild"
                    ? node.radius * 0.7 + 14
                    : node.radius + 14
                }
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize={node.type === "domain" ? 12 : 10}
                fontWeight={node.type === "domain" ? 600 : 400}
                className="pointer-events-none select-none"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
          style={{
            left: Math.min(tooltip.x + 15, dimensions.width - 160),
            top: Math.max(tooltip.y - 40, 10),
          }}
        >
          <p className="text-sm font-medium">{tooltip.node.label}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {tooltip.node.type}
            {tooltip.node.domain ? ` — ${tooltip.node.domain}` : ""}
          </p>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.98); }
          50% { transform: scale(1.02); }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -30; }
        }
      `}</style>
    </div>
  );
}
