import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Loads the institutional TKRCET logo as a base64 Data URL.
 */
const loadLogoBase64 = async () => {
  try {
    const res = await fetch('/tkrcet-official-logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load official logo for PDF:', err);
    return null;
  }
};

/**
 * Generates an official, high-resolution A4 Printable Room Placard PDF.
 * Supports batch generation for all rooms with progress tracking,
 * or single placard generation.
 *
 * @param {Array} allocations - List of allocation objects
 * @param {Object} options - { onProgress, filename, singleRoom }
 */
export const generatePlacardsPDF = async (allocations = [], options = {}) => {
  const { onProgress, filename, singleRoom } = options;

  // Filter to valid allocated rooms
  const validAllocations = allocations.filter(
    (item) => item.room_number && item.room_number !== 'Unallocated'
  );

  if (validAllocations.length === 0) {
    throw new Error('No allocated rooms found to export. Please assign rooms to companies first.');
  }

  const logoDataUrl = await loadLogoBase64();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const total = validAllocations.length;

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const originUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://jobmela.vercel.app';

  for (let i = 0; i < total; i++) {
    const item = validAllocations[i];

    if (i > 0) {
      doc.addPage();
    }

    if (onProgress) {
      onProgress(i + 1, total, item);
    }

    // Determine candidate check-in URL
    const token = item.unique_room_token || `room-${item.room_id || item.room_number}`;
    const checkinUrl = `${originUrl}/checkin/${token}`;

    // 1. Outer Multi-line Framed Placard Border
    doc.setDrawColor(15, 46, 90); // Dark TKRCET Navy
    doc.setLineWidth(1.6);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(203, 213, 225); // Subtle inner border
    doc.setLineWidth(0.4);
    doc.rect(10.5, 10.5, pageWidth - 21, pageHeight - 21);

    // 2. Institutional Header Section
    let headerY = 22;
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 16, 14, 18, 18);
      } catch (e) {
        // Fallback if image fails to render
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.setTextColor(15, 46, 90); // TKRCET Navy
    doc.text('TKR COLLEGE OF ENGINEERING & TECHNOLOGY', 105, headerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('(Autonomous • Approved by AICTE • Affiliated to JNTUH • NAAC "A+" Grade)', 105, headerY + 5.5, {
      align: 'center',
    });

    // 3. Official Event Banner
    const bannerY = headerY + 11;
    doc.setFillColor(10, 25, 47); // Rich dark blue-black
    doc.rect(11, bannerY, pageWidth - 22, 11, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(253, 224, 71); // Gold
    doc.text('MEGA JOB MELA 2026  •  OFFICIAL INTERVIEW ROOM PLACARD', 105, bannerY + 7.2, {
      align: 'center',
    });

    // 4. Large Room Number Badge Card
    const roomCardY = bannerY + 16;
    doc.setFillColor(243, 244, 246); // Slate-100
    doc.setDrawColor(99, 102, 241); // Indigo border
    doc.setLineWidth(0.8);
    doc.roundedRect(18, roomCardY, pageWidth - 36, 26, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('VENUE / ALLOCATED INTERVIEW ROOM', 105, roomCardY + 6.5, { align: 'center' });

    doc.setFontSize(26);
    doc.setTextColor(67, 56, 202); // Deep Indigo
    const roomText = String(item.room_number || '').toUpperCase();
    doc.text(roomText.startsWith('ROOM') ? roomText : `ROOM ${roomText}`, 105, roomCardY + 19, {
      align: 'center',
    });

    // 5. Company Details Card
    const compCardY = roomCardY + 31;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.roundedRect(18, compCardY, pageWidth - 36, 34, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PARTICIPATING RECRUITER', 105, compCardY + 6, { align: 'center' });

    const companyName = item.company_name || 'Participating Recruiter';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    const splitName = doc.splitTextToSize(companyName, pageWidth - 46);
    doc.text(splitName, 105, compCardY + 14.5, { align: 'center' });

    const sectorText = item.sector ? `Sector: ${item.sector}` : '';
    const roleText = item.job_position ? `Role: ${item.job_position}` : '';
    const subMeta = [sectorText, roleText].filter(Boolean).join('   |   ');

    if (subMeta) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const splitMeta = doc.splitTextToSize(subMeta, pageWidth - 46);
      doc.text(splitMeta, 105, compCardY + 26, { align: 'center' });
    }

    // 6. Vector High-Resolution QR Code
    const qrSize = 82; // 82mm square
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = compCardY + 38;

    const qrDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 400,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0a192f',
        light: '#ffffff',
      },
    });

    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Direct URL reference under QR
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(checkinUrl, 105, qrY + qrSize + 5, { align: 'center' });

    // 7. Candidate Instructions Box
    const instY = qrY + qrSize + 9;
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(167, 243, 208); // Emerald-200
    doc.setLineWidth(0.6);
    doc.roundedRect(18, instY, pageWidth - 36, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(4, 120, 87); // Emerald-700
    doc.text('📱 SCAN WITH SMARTPHONE CAMERA TO CHECK IN', 105, instY + 6.8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(6, 95, 70); // Emerald-800
    doc.text(
      'All registered candidates must scan this placard upon entering the room to register interview attendance.',
      105,
      instY + 13.5,
      { align: 'center' }
    );

    // 8. Footer Section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      'Event Date: 31 October 2026  •  TKRCET Campus, Meerpet, Hyderabad  •  Training & Placement Cell',
      105,
      pageHeight - 14,
      { align: 'center' }
    );

    doc.text(`Page ${i + 1} of ${total}`, pageWidth - 14, pageHeight - 14, { align: 'right' });
  }

  // Determine final filename
  let outName = filename;
  if (!outName) {
    if (singleRoom && validAllocations.length === 1) {
      const rNum = String(validAllocations[0].room_number || '').replace(/[^a-zA-Z0-9_-]/g, '_');
      outName = `TKRCET_Room_${rNum}_QR_Placard.pdf`;
    } else {
      outName = `TKRCET_JobMela_2026_All_Room_QR_Placards.pdf`;
    }
  }

  // Trigger browser download of PDF
  doc.save(outName);
  return { success: true, count: total, filename: outName };
};
