export async function validateEmailVerifalia(email: string) {
  const username = process.env.VERIFALIA_USERNAME;
  const password = process.env.VERIFALIA_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing Verifalia credentials in environment variables.");
  }

  const response = await fetch('https://api.verifalia.com/v2.4/email-validations?async=false', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      entries: [{ inputData: email }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Verifalia request failed: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  console.log('Verifalia full response:', JSON.stringify(data)); // helpful for debugging

  const result = data.entries?.data?.[0];
  console.log('Verifalia result:', JSON.stringify(result)); // helpful for debugging

  if (!result) {
    throw new Error(`Email validation failed for ${email}: No result returned`);
  }

  const { status, classification } = result;

  if (classification === 'Deliverable') {
    return { status, classification, success: true };
  }

  if (status === 'MailboxDoesNotExist'){
    return {
      status,
      classification: 'Undeliverable',
      success: false,
      message: `Email classified as Undeliverable. Mailbox does not exist.`,
    };
  }

  if (classification === 'Risky' || classification === 'Unknown' || classification === 'Undeliverable') {
    return {
      status,
      classification,
      success: false,
      message: `Email classified as ${classification}. Proceed with caution.`,
    };
  }

  return {
    success: false,
    status,
    classification,
    message: `Email validation failed for ${email}: ${status || classification || 'Unspecified reason'}`,
  };
}
