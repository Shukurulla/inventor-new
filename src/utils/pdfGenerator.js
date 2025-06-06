import jsPDF from "jspdf";

export const generateQRCodesPDF = async (qrData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let yPosition = 20;
  const itemHeight = 60;
  const itemsPerPage = Math.floor((pageHeight - 40) / itemHeight);

  pdf.setFontSize(16);
  pdf.text("QR-коды оборудования", pageWidth / 2, 15, { align: "center" });

  for (let i = 0; i < qrData.length; i++) {
    const item = qrData[i];

    // Если нужна новая страница
    if (i > 0 && i % itemsPerPage === 0) {
      pdf.addPage();
      yPosition = 20;
      pdf.setFontSize(16);
      pdf.text("QR-коды оборудования", pageWidth / 2, 15, { align: "center" });
    }

    // Название оборудования
    pdf.setFontSize(12);
    pdf.text(item.name, 20, yPosition);

    // ИНН
    pdf.setFontSize(10);
    pdf.text(`ИНН: ${item.inn}`, 20, yPosition + 10);

    // QR код (если есть URL)
    if (item.qrCodeUrl) {
      try {
        // Загружаем QR код как изображение
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Добавляем изображение в PDF
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", pageWidth - 60, yPosition - 5, 40, 40);
            resolve();
          };
          img.onerror = reject;
          img.src = item.qrCodeUrl;
        });
      } catch (error) {
        console.error("Ошибка загрузки QR кода:", error);
        // Рисуем заглушку
        pdf.rect(pageWidth - 60, yPosition - 5, 40, 40);
        pdf.text("QR", pageWidth - 42, yPosition + 15);
      }
    } else {
      // Рисуем заглушку если нет QR кода
      pdf.rect(pageWidth - 60, yPosition - 5, 40, 40);
      pdf.text("QR", pageWidth - 42, yPosition + 15);
    }

    yPosition += itemHeight;
  }

  // Скачиваем PDF
  pdf.save("equipment-qr-codes.pdf");
};
