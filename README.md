# Hermes - AI Agent Command Center

![Hermes Dashboard](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)

Hermes is a premium, glassmorphism-styled dashboard designed for managing AI agents, tasks, and workflows. It features a modern, 3D-feeling UI with deep shadows, frosted glass effects, and smooth animations.

## Features

- **Command Center:** Global control and health overview with real-time workflow activity charts and active profile monitoring.
- **Task Board (Kanban):** Drag-and-drop Kanban board for managing agent task pipelines (Backlog, Planned, Running, Completed).
- **Ticket Drawer:** Detailed view for editing tickets, viewing history, and launching runs.
- **Agent Profiles:** Manage and configure AI agent profiles with customizable settings and avatars.
- **Premium UI/UX:** 
  - Advanced glassmorphism with dynamic backdrop blurs.
  - 3D-feeling cards, panels, and buttons with inset shadows.
  - Smooth transitions and animations using Framer Motion.
  - Customizable dashboard logo and user profile.

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (with custom glassmorphism utilities)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Drag & Drop:** @dnd-kit
- **Charts:** Recharts
- **Backend/Database:** Express, Better-SQLite3, Drizzle ORM

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hermes-dashboard.git
   cd hermes-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy the `.env.example` file to `.env` and fill in any required values.
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```
├── src/
│   ├── components/      # React components (Sidebar, KanbanBoard, etc.)
│   │   └── ui/          # Reusable UI components (GlassComponents)
│   ├── lib/             # Utility functions
│   ├── store/           # Zustand state management
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and Tailwind configuration
├── server.ts            # Express server entry point
├── package.json         # Project dependencies and scripts
├── vite.config.ts       # Vite configuration
└── .gitignore           # Git ignore rules
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
