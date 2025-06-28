import jsPDF from "jspdf";

// Helper function to load image and convert to base64
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = this.naturalWidth || this.width || 200;
        canvas.height = this.naturalHeight || this.height || 200;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this, 0, 0);

        const dataURL = canvas.toDataURL("image/png", 1.0);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = function (error) {
      reject(new Error(`Failed to load image: ${url}`));
    };

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

// Enhanced QR code PDF generator with simplified layout
export const generateQRCodesPDF = async (equipmentData) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Layout constants
    const margin = 10;
    const headerHeight = 20;
    const itemsPerRow = 2;
    const rowsPerPage = 4;
    const itemsPerPage = itemsPerRow * rowsPerPage;
    const itemWidth = (pageWidth - margin * 3) / itemsPerRow;
    const itemHeight = (pageHeight - headerHeight - margin * 2) / rowsPerPage;

    let currentPage = 1;
    let processedItems = 0;

    // Add header
    const addHeader = (pageNum) => {
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Inventar QR Kodlari", margin, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Sahifa ${pageNum}`, pageWidth - margin, 15, { align: "right" });
    };

    addHeader(currentPage);

    // Process each equipment item
    for (let i = 0; i < equipmentData.length; i++) {
      const equipment = equipmentData[i];

      // Check if we need a new page
      if (processedItems > 0 && processedItems % itemsPerPage === 0) {
        pdf.addPage();
        currentPage++;
        addHeader(currentPage);
      }

      // Calculate position
      const itemIndex = processedItems % itemsPerPage;
      const column = itemIndex % itemsPerRow;
      const row = Math.floor(itemIndex / itemsPerRow);
      const x = margin + column * (itemWidth + margin);
      const y = headerHeight + row * itemHeight;

      // Equipment name
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const equipmentName = equipment.name || "Equipment";
      const nameLines = pdf.splitTextToSize(equipmentName, itemWidth - 10);
      let currentTextY = y + 10;
      for (let j = 0; j < Math.min(nameLines.length, 2); j++) {
        pdf.text(nameLines[j], x + 5, currentTextY);
        currentTextY += 6;
      }

      // Add INN below equipment name
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      currentTextY += 6;
      pdf.text(`INN: ${equipment.inn || "N/A"}`, x + 5, currentTextY);

      // QR Code section
      const qrSize = 30; // Reduced QR code size
      const qrX = x + 5;
      const qrY = currentTextY + 6; // Place below INN

      // Generate QR code URL
      let qrCodeUrl = null;
      if (equipment.inn) {
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${equipment.inn}&size=200x200&bgcolor=FFFFFF&color=000000&format=png&margin=5`;
      }

      // Try to load and add QR code
      if (qrCodeUrl) {
        try {
          const qrImageData = await loadImageAsBase64(qrCodeUrl);
          pdf.addImage(qrImageData, "PNG", qrX, qrY, qrSize, qrSize);
        } catch (qrError) {
          createQRPlaceholder(pdf, qrX, qrY, qrSize, "ERROR");
        }
      } else {
        createQRPlaceholder(pdf, qrX, qrY, qrSize, "NO INN");
      }

      processedItems++;
    }

    // Add footer
    const totalPages = Math.ceil(equipmentData.length / itemsPerPage);
    for (let page = 1; page <= totalPages; page++) {
      if (page > 1) {
        pdf.setPage(page);
      }
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Created: ${new Date().toLocaleDateString("uz-UZ")}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    }

    // Save PDF
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `qr-codes-${currentDate}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    throw new Error(`PDF yaratishda xatolik: ${error.message}`);
  }
};
