import { useUser } from "../context/UserContext";

const STORAGE_KEYS = {
  TICKETS: "docusphere_support_tickets",
};

// Seed initial tickets if none exist, using localStorage
function getStoredTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read support tickets from localStorage", e);
    return [];
  }
}

function saveTickets(tickets) {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error("Failed to save support tickets to localStorage", e);
  }
}

export const supportService = {
  /**
   * Fetches all tickets submitted by the user
   */
  async getTickets() {
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredTickets();
  },

  /**
   * Fetches detailed ticket by ID
   */
  async getTicketById(id) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tickets = getStoredTickets();
    const ticket = tickets.find((t) => String(t.id) === String(id));
    if (!ticket) throw new Error("Ticket not found");
    return ticket;
  },

  /**
   * Creates a new support ticket
   */
  async createTicket(ticketData) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const tickets = getStoredTickets();
    const newId = tickets.length > 0 ? Math.max(...tickets.map((t) => t.id)) + 1 : 1024;

    const newTicket = {
      id: newId,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      description: ticketData.description,
      status: "Open", // Open, In Progress, Resolved, Closed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 1,
          sender: "user",
          text: ticketData.description,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    tickets.unshift(newTicket);
    saveTickets(tickets);

    // Trigger an automatic response simulator in background
    this.scheduleMockAgentResponse(newId);

    return newTicket;
  },

  /**
   * Appends a message to a ticket conversation
   */
  async addTicketMessage(id, text) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const tickets = getStoredTickets();
    const ticketIndex = tickets.findIndex((t) => String(t.id) === String(id));
    if (ticketIndex === -1) throw new Error("Ticket not found");

    const ticket = tickets[ticketIndex];
    const newMessage = {
      id: ticket.messages.length + 1,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date().toISOString();
    
    // Auto shift status to Open or In Progress on new user message if resolved/closed
    if (ticket.status === "Resolved" || ticket.status === "Closed") {
      ticket.status = "Open";
    }

    tickets[ticketIndex] = ticket;
    saveTickets(tickets);

    this.scheduleMockAgentResponse(id);

    return ticket;
  },

  /**
   * Simulates support agent replies after 2 seconds
   */
  scheduleMockAgentResponse(ticketId) {
    setTimeout(async () => {
      try {
        const tickets = getStoredTickets();
        const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
        if (ticketIndex === -1) return;

        const ticket = tickets[ticketIndex];
        // Only reply if last message was from user
        const lastMsg = ticket.messages[ticket.messages.length - 1];
        if (lastMsg.sender !== "user") return;

        let replyText = "";
        const lowerSubject = ticket.subject.toLowerCase();
        const lowerDesc = ticket.description.toLowerCase();

        // Basic intelligent replies based on categories or keywords
        if (ticket.category === "OCR" || lowerSubject.includes("ocr") || lowerDesc.includes("ocr")) {
          replyText = "Hello! Thanks for reaching out about OCR text extraction. Scanned PDFs with low contrast or handwritten text may take longer to process or sometimes fail. Could you please double check if the PDF is text-selectable or let us know if other document formats are working?";
        } else if (ticket.category === "AI Summarization" || lowerSubject.includes("ai") || lowerSubject.includes("summar")) {
          replyText = "Hi there! I understand you are experiencing issues with the AI summary features. The AI summarizer relies on Gemini integrations, which occasionally hit usage quotas. We are looking into this, but in the meantime, please try re-running OCR on your document or contact your workspace admin.";
        } else if (ticket.category === "Security" || lowerSubject.includes("password")) {
          replyText = "Hello! Document security is a top priority. As the owner of the document, you can reset or update the security password under the document settings menu. If you are accessing via a shared link, only the original owner can change the password or grant permission.";
        } else {
          replyText = "Hello! Thank you for contacting DocuSphere Support. We have received your query regarding '" + ticket.subject + "'. One of our support representatives has been assigned to this ticket and is investigating the issue. We'll update you here as soon as we have more details.";
        }

        const agentMessage = {
          id: ticket.messages.length + 1,
          sender: "support",
          text: replyText,
          timestamp: new Date().toISOString(),
        };

        ticket.messages.push(agentMessage);
        // Automatically shift status to "In Progress" when support replies
        ticket.status = "In Progress";
        ticket.updatedAt = new Date().toISOString();

        tickets[ticketIndex] = ticket;
        saveTickets(tickets);

        // Dispatch a custom event so the UI can refresh if the user is currently viewing the ticket detail
        window.dispatchEvent(new CustomEvent("docusphere_support_ticket_updated", { detail: { ticketId } }));
      } catch (e) {
        console.error("Failed to generate simulated support reply", e);
      }
    }, 2000);
  },
};
