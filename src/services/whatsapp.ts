// Helper puro para gerar links de WhatsApp (não depende de nenhum storage)

export function getWhatsAppUrl(
  phoneOrWhatsapp: string,
  personName: string,
  context: "lead" | "student" = "lead"
): string {
  const digits = (phoneOrWhatsapp || "").replace(/\D/g, "");
  if (!digits) return "";

  let fullNumber = digits;
  if (fullNumber.length === 10 || fullNumber.length === 11) {
    fullNumber = `55${fullNumber}`;
  }

  const greeting =
    context === "lead"
      ? `Olá ${personName}, tudo bem?\n\nSou o Henrique, faço parte do projeto Pra Ser Feliz que você participou na semana passada, e estou entrando em contato para saber como você está!`
      : `Olá ${personName}! Que a paz de Deus esteja com você! Passando para conversarmos sobre nosso próximo estudo bíblico em Ivatuba. Como foi a semana?`;

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(greeting)}`;
}
