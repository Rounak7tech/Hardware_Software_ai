import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  margin?: number;
}

export interface ProjectData {
  name: string;
  description: string;
  components: string[];
  difficulty: string;
  code: string;
  wiring: Array<{
    instruction: string;
    image_url: string;
    component: string;
  }>;
}

/**
 * Export a project to PDF with code, wiring instructions, and component list
 */
export const exportProjectToPDF = async (
  elementId: string,
  projectData: ProjectData,
  options: PDFExportOptions = {}
): Promise<void> => {
  const {
    filename = `${projectData.name.replace(/\s+/g, '_')}_project.pdf`,
    quality = 0.98,
    scale = 2,
    backgroundColor = '#ffffff',
    margin = 20
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create canvas from HTML element
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor,
    quality,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png', quality);
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate dimensions
  const imgWidth = pageWidth - (margin * 2);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;

  // Add title page
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(projectData.name, pageWidth / 2, 30, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Difficulty: ${projectData.difficulty}`, pageWidth / 2, 45, { align: 'center' });
  
  pdf.setFontSize(10);
  const descriptionLines = pdf.splitTextToSize(projectData.description, pageWidth - (margin * 2));
  pdf.text(descriptionLines, margin, 60);
  
  // Add components list
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Required Components:', margin, 80);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  projectData.components.forEach((component, index) => {
    pdf.text(`• ${component}`, margin + 5, 90 + (index * 5));
  });

  pdf.addPage();

  // Add the main content
  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add additional pages if content is too long
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Add wiring instructions page
  if (projectData.wiring.length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Wiring Instructions', margin, 20);
    
    projectData.wiring.forEach((step, index) => {
      const yPosition = 35 + (index * 40);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Step ${index + 1}: ${step.component}`, margin, yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const instructionLines = pdf.splitTextToSize(step.instruction, pageWidth - (margin * 2));
      pdf.text(instructionLines, margin, yPosition + 8);
    });
  }

  // Add code page
  if (projectData.code) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Generated Code', margin, 20);
    
    pdf.setFontSize(8);
    pdf.setFont('courier', 'normal');
    const codeLines = pdf.splitTextToSize(projectData.code, pageWidth - (margin * 2));
    pdf.text(codeLines, margin, 35);
  }

  // Save the PDF
  pdf.save(filename);
};

/**
 * Export any HTML element to PDF
 */
export const exportElementToPDF = async (
  elementId: string,
  filename: string = 'export.pdf',
  options: PDFExportOptions = {}
): Promise<void> => {
  const {
    quality = 0.98,
    scale = 2,
    backgroundColor = '#ffffff',
    margin = 20
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor,
    quality,
    logging: false
  });

  const imgData = canvas.toDataURL('image/png', quality);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth - (margin * 2);
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};

/**
 * Export project documentation with multiple sections
 */
export const exportProjectDocumentation = async (
  projectData: ProjectData,
  codeElementId?: string,
  wiringElementId?: string,
  filename: string = 'project_documentation.pdf'
): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(projectData.name, pageWidth / 2, 50, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Hardware Project Documentation', pageWidth / 2, 70, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`Difficulty: ${projectData.difficulty}`, pageWidth / 2, 90, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 100, { align: 'center' });

  // Description page
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Project Description', margin, 30);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const descriptionLines = pdf.splitTextToSize(projectData.description, pageWidth - (margin * 2));
  pdf.text(descriptionLines, margin, 45);

  // Components page
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Required Components', margin, 30);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  projectData.components.forEach((component, index) => {
    pdf.text(`${index + 1}. ${component}`, margin, 50 + (index * 8));
  });

  // Wiring instructions page
  if (projectData.wiring.length > 0) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Wiring Instructions', margin, 30);
    
    let yPosition = 50;
    projectData.wiring.forEach((step, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Step ${index + 1}: ${step.component}`, margin, yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const instructionLines = pdf.splitTextToSize(step.instruction, pageWidth - (margin * 2));
      pdf.text(instructionLines, margin, yPosition + 10);
      
      yPosition += 10 + (instructionLines.length * 5) + 15;
    });
  }

  // Code page
  if (projectData.code) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Generated Code', margin, 30);
    
    pdf.setFontSize(8);
    pdf.setFont('courier', 'normal');
    const codeLines = pdf.splitTextToSize(projectData.code, pageWidth - (margin * 2));
    
    let yPosition = 45;
    codeLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 4;
    });
  }

  pdf.save(filename);
};

