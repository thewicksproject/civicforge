import twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return twilio(accountSid, authToken);
}

function getServiceSid() {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!serviceSid) {
    throw new Error("Twilio Verify service SID not configured");
  }
  return serviceSid;
}

export async function sendVerificationCode(phone: string) {
  const client = getClient();
  const serviceSid = getServiceSid();

  const verification = await client.verify.v2
    .services(serviceSid)
    .verifications.create({
      to: phone,
      channel: "sms",
    });

  return { status: verification.status };
}

export async function checkVerificationCode(phone: string, code: string) {
  const client = getClient();
  const serviceSid = getServiceSid();

  const check = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      to: phone,
      code,
    });

  return { valid: check.status === "approved" };
}
