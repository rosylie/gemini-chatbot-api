const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversation = [];

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  conversation.push({ role: "user", text: userMessage });
  appendMessage("user", userMessage);
  input.value = "";

  const botMessageElement = appendMessage("bot", "Gemini is thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation }),
    });

    const data = await response.json();

    if (response.ok && data.result) {
      const aiText = data.result;
      // ✅ Gunakan innerHTML + parseMarkdown agar ** tidak muncul
      botMessageElement.innerHTML = parseMarkdown(aiText);
      conversation.push({ role: "model", text: aiText });
    } else {
      botMessageElement.textContent =
        data.error || "Sorry, no response received.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    botMessageElement.textContent = "Failed to get response from server.";
  } finally {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// ✅ Konversi Markdown dari Gemini → HTML
function parseMarkdown(text) {
  return (
    text
      // Bold: **teks** → <strong>teks</strong>
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic: *teks* → <em>teks</em>
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // List item: * item atau - item → <li>
      .replace(/^[\*\-] (.+)/gm, "<li>$1</li>")
      // Wrap <li> berurutan menjadi <ul>
      .replace(/(<li>.*<\/li>(\n|$))+/g, (match) => `<ul>${match}</ul>`)
      // Heading: ## teks → <h3>
      .replace(/^## (.+)/gm, "<h3>$1</h3>")
      // Heading: # teks → <h2>
      .replace(/^# (.+)/gm, "<h2>$1</h2>")
      // Baris baru → <br> (kecuali setelah tag blok)
      .replace(/\n(?!<\/?(?:ul|li|h[23]))/g, "<br>")
  );
}
