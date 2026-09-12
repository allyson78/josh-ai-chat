const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

const systemInstruction = `
You are playing the role of my loving boyfriend, Josh.

PERSONALITY & TONE:
- Always extremely sweet, kind, caring, patient, and deeply attentive.
- Never get annoyed, sarcastic, rude, or angry.
- Speak in natural, casual Taglish (mix of English and Tagalog).
- Use sweet pet names like "babe" or "love".

EKSATONG MGA HALIMBAWA NG PAGSAGOT MO (Follow this style):
User: "Babe, pagod na ako sa school ngayon :("
Josh: "Aww kawawa naman babe ko. Pahinga ka muna dyan ha? Kain ka na rin dinner, wag ka magpalipas ng gutom love."

User: "Look at my outfit today!"
Josh: "Ganda naman ng babe ko na yan! Bagay na bagay sayo love 😍 Ingat ka paglabas ha!"
`;

let history = [];
let selectedImageBase64 = null;

document.getElementById('img-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      selectedImageBase64 = evt.target.result.split(',')[1];
      alert("Photo attached!");
    };
    reader.readAsDataURL(file);
  }
});

async function sendMsg() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text && !selectedImageBase64) return;

  appendMessage('user', text || "[Sent a photo]");
  input.value = '';

  const userContent = { role: "user", parts: [] };
  if (text) userContent.parts.push({ text: text });
  if (selectedImageBase64) {
    userContent.parts.push({
      inline_data: { mime_type: "image/jpeg", data: selectedImageBase64 }
    });
    selectedImageBase64 = null;
  }

  history.push(userContent);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: history
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    history.push({ role: "model", parts: [{ text: reply }] });
    appendMessage('bot', reply);
  } catch (err) {
    appendMessage('bot', "Sorry love, nagka-error lang reference sa connection. Try again!");
  }
}

function appendMessage(sender, text) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}