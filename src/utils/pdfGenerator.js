import jsPDF from "jspdf";

// Helper function to load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        console.log("Image loaded successfully:", this.src);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = this.naturalWidth || this.width || 200;
        canvas.height = this.naturalHeight || this.height || 200;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        const dataURL = canvas.toDataURL("image/png", 1.0);
        console.log("Successfully converted to base64");
        resolve(dataURL);
      } catch (error) {
        console.error("Canvas error:", error);
        reject(error);
      }
    };

    img.onerror = function (error) {
      console.error("Image load error:", error);
      reject(new Error(`Failed to load image: ${url}`));
    };

    console.log("Loading image from:", url);
    img.src = url;
  });
};

// Function to create QR code placeholder
const createQRPlaceholder = (pdf, x, y, size, text = "QR") => {
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(1);
  pdf.rect(x, y, size, size);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(x + 1, y + 1, size - 2, size - 2, "F");
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(text, x + size / 2, y + size / 2, { align: "center" });
};

// Enhanced QR code PDF generator
export const generateQRCodesPDF = async (equipmentData) => {
  try {
    console.log("Starting PDF generation with data:", equipmentData);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Layout constants
    const margin = 20;
    const headerHeight = 25;
    const footerHeight = 15;
    const availableHeight = pageHeight - headerHeight - footerHeight;

    // Item layout (2 columns)
    const itemsPerRow = 2;
    const itemWidth = (pageWidth - margin * 3) / itemsPerRow;
    const itemHeight = 60; // Reduced height for minimal design
    const itemsPerPage = Math.floor(availableHeight / itemHeight);

    let currentPage = 1;
    let currentY = headerHeight;
    let itemsOnCurrentPage = 0;

    // Add header
    const addHeader = (pageNum) => {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("QR-коды оборудования", pageWidth / 2, 15, { align: "center" });

      if (equipmentData.length > itemsPerPage) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Страница ${pageNum}`, pageWidth - margin, 20, {
          align: "right",
        });
      }
    };

    // Add first page header
    addHeader(currentPage);

    for (let i = 0; i < equipmentData.length; i++) {
      const equipment = equipmentData[i];
      console.log(`Processing equipment ${i + 1}:`, equipment.name);

      // Check if we need a new page
      if (itemsOnCurrentPage >= itemsPerPage) {
        pdf.addPage();
        currentPage++;
        addHeader(currentPage);
        currentY = headerHeight;
        itemsOnCurrentPage = 0;
      }

      // Calculate position
      const column = itemsOnCurrentPage % itemsPerRow;
      const row = Math.floor(itemsOnCurrentPage / itemsPerRow);
      const x = margin + column * (itemWidth + margin);
      const y = currentY + row * itemHeight;

      // If starting new row, update currentY
      if (column === 0 && itemsOnCurrentPage > 0) {
        currentY += itemHeight;
      }

      // Draw simple border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.rect(x, y, itemWidth, itemHeight - 5);

      // Equipment name and INN - SIMPLIFIED
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);

      const equipmentName = equipment.name || "Equipment";
      const displayText = `${equipmentName}: ${equipment.inn || "N/A"}`;

      // Split text if too long
      const nameLines = pdf.splitTextToSize(displayText, itemWidth - 60);

      let textY = y + 10;
      for (let j = 0; j < Math.min(nameLines.length, 3); j++) {
        pdf.text(nameLines[j], x + 5, textY);
        textY += 5;
      }

      // QR Code area - BIGGER
      const qrSize = 40; // Increased QR size
      const qrX = x + itemWidth - qrSize - 5;
      const qrY = y + 5;

      // Generate QR code URL using external service - SIMPLIFIED DATA
      let qrCodeUrl = null;
      if (equipment.inn) {
        // Simple QR data - just the INN
        const qrData = encodeURIComponent(equipment.inn);
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200&bgcolor=FFFFFF&color=000000&format=png`;
        console.log(`Generated QR URL for "${equipment.name}": ${qrCodeUrl}`);
      }

      // Try to load and add QR code
      if (qrCodeUrl) {
        try {
          console.log(`Processing QR code for "${equipment.name}"`);

          const qrImageData = await loadImageAsBase64(qrCodeUrl);

          // Add QR code image
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
          console.log(`✅ Successfully added QR code for "${equipment.name}"`);
        } catch (qrError) {
          console.error(
            `❌ QR code loading failed for "${equipment.name}":`,
            qrError.message
          );
          createQRPlaceholder(pdf, qrX, qrY, qrSize, "ERROR");
        }
      } else {
        console.log(
          `⚠️ No INN available for QR code generation for "${equipment.name}"`
        );
        createQRPlaceholder(pdf, qrX, qrY, qrSize, "NO INN");
      }

      itemsOnCurrentPage++;
    }

    // Generate filename
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `qr-codes-${currentDate}.pdf`;

    // Save PDF
    pdf.save(fileName);
    console.log("PDF generation completed successfully");

    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(`Ошибка при создании PDF: ${error.message}`);
  }
};
