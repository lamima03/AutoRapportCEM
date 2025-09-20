const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const result = document.getElementById("result");


const baseUrl = "http://localhost:3000"; 


// Quand on sélectionne un fichier, remet le bouton en bleu
fileInput.addEventListener("change", () => {
  uploadBtn.classList.remove("bg-green-600");
  uploadBtn.classList.add("bg-blue-600");
  uploadBtn.textContent = "🚀 Envoyer";
});

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Veuillez choisir un fichier .docx !");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  // Désactive le bouton pendant l'envoi
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⏳ Envoi en cours...";
  result.innerHTML = `⏳ <b>${file.name}</b> est en cours d'envoi...`;

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Erreur serveur");

    const data = await response.json();

    if (data.error) {
      result.innerHTML = `<span class="text-red-600">❌ Erreur: ${data.error}</span>`;
    } else {
      result.innerHTML = `
        ✅ <span class="font-semibold">${file.name}</span> analysé avec succès !<br><br>
        🔎 Verdict Global: <b class="text-blue-600">${data.verdict}</b><br><br>

        📥 <a href="${data.csvUrl}" download="result.csv">Télécharger CSV</a><br>

        📥 <a href="${data.docxUrl}" download="result.docx">Télécharger DOCX</a>

      `;

      // Réinitialise le champ input
      fileInput.value = "";

      // Change le bouton en vert pour montrer le succès
      uploadBtn.classList.remove("bg-blue-600");
      uploadBtn.classList.add("bg-green-600");
      uploadBtn.textContent = "✅ Envoyé";
    }

  } catch (err) {
    console.error(err);
    result.innerHTML = `<span class="text-red-600">❌ Erreur lors de l'envoi du fichier</span>`;
    uploadBtn.classList.remove("bg-green-600");
    uploadBtn.classList.add("bg-blue-600");
    uploadBtn.textContent = "🚀 Envoyer";
  } finally {
    uploadBtn.disabled = false;
  }
});


