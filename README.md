# DebtVision - AI-Powered Debt Management

This is a Next.js application built with Firebase Studio, designed to help manage debts with AI-powered insights.

## Tech Stack

*   **Framework**: Next.js (App Router)
*   **UI**: React, ShadCN UI, Tailwind CSS
*   **AI**: Genkit (with Google AI models)
*   **Backend/Auth**: Firebase (Authentication, Firestore for data persistence - simulated with localStorage in this version)
*   **Language**: TypeScript
*   **Internationalization**: `next-intl` (supporting English and Arabic)

## Getting Started

### Prerequisites

*   Node.js (version 18.x or later recommended)
*   npm, yarn, or pnpm

### Environment Variables

1.  Create a `.env.local` file in the root of the project by copying `.env.example`.
2.  Fill in your Firebase project configuration details in `.env.local`. You can find these in your Firebase project settings.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

    # Optional: If using Google AI directly with an API key for Genkit
    # GOOGLE_API_KEY=your_google_ai_api_key
    ```

### Installation

1.  Clone the repository (if applicable).
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Running the Development Server

1.  Start the Next.js development server:
    ```bash
    npm run dev
    ```
    This will typically start the app on `http://localhost:9002` (as per your `package.json`).

2.  (Optional) Start the Genkit development server if you are actively developing or testing Genkit flows locally:
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```
    The Genkit developer UI is usually available at `http://localhost:4000`.

The application should now be running. Navigate to `http://localhost:9002` (or your configured port) in your browser.

## Project Structure Key Files

*   `src/app/`: Contains the main application pages and layouts (using Next.js App Router).
    *   `src/app/[locale]/`: Language-specific routes and layouts.
*   `src/components/`: Reusable UI components.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/ai/`: Genkit related code.
    *   `src/ai/flows/`: Genkit flow definitions.
*   `src/contexts/`: React context providers (e.g., Auth, Debtors).
*   `src/lib/`: Utility functions and Firebase initialization.
*   `src/messages/`: Translation files for `next-intl`.
*   `middleware.ts`: Handles `next-intl` routing.
*   `src/i18n.ts`: Configuration for `next-intl`.

## Building for Production

To create a production build:
```bash
npm run build
```

To start the production server:
```bash
npm run start
```
