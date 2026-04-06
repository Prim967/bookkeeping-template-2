exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { name, email, service, message } = JSON.parse(event.body);

  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Name and email are required." }) };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Clarity Bookkeeping <onboarding@resend.dev>",
        to: "dalton.joyner1@gmail.com",
        subject: `New inquiry from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Service:</strong> ${service || "Not specified"}</p>
          <p><strong>Message:</strong></p>
          <p>${message || "No message provided."}</p>
        `,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send email." }) };
  }
};
