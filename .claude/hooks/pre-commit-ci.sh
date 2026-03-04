#!/bin/bash
set -e

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git commit and git push
if ! [[ "$COMMAND" =~ git\ (commit|push) ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

# Lint
LINT_OUTPUT=$(npm run lint --silent 2>&1) || \
  deny "ESLint failed. Fix lint errors before committing.

$(echo "$LINT_OUTPUT" | tail -30)"

# Tests
TEST_OUTPUT=$(npm run test --silent 2>&1) || \
  deny "Tests failed. Fix test failures before committing.

$(echo "$TEST_OUTPUT" | tail -30)"

exit 0
