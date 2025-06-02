document.getElementById("processBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("receiptInput");
    const status = document.getElementById("status");

    if (!fileInput.files.length) return alert("Please upload a receipt");
  
    const file = fileInput.files[0];
    const imgURL = URL.createObjectURL(file);
  
    status.textContent = "Running OCR...";

    try {
        const result = await Tesseract.recognize(imgURL, "eng");
        const text = result.data.text;
        console.log("OCR Text: ", text);

        // Simple parser: get lines with a price format
        const lines = text.split("\n");
        const data = [];

        lines.forEach(line => {
            const match = line.match(/(.+?)\s+(\d+\.\d{2})$/);
            if (match) {
              data.push({ item: match[1].trim(), price: parseFloat(match[2]) });
              console.log("Data: ", data);
            }
          });

           // Add Excel headers
        const worksheetData = [["Item", "Price"], ...data.map(d => [d.item, d.price])];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Receipt");
        XLSX.writeFile(workbook, "receipt.xlsx");
    
        status.textContent = "Excel file downloaded!";

    }catch(error){
        console.log(error);
    }
    
  });
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js');
    });
  }
  