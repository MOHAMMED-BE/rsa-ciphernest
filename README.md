# CipherNest - Secure Password Manager

## Project Overview

CipherNest is a secure password manager that utilizes RSA encryption to protect your sensitive information. It provides a user-friendly interface for storing, managing, and generating strong passwords. This application prioritizes security and offers persistent data storage for seamless access across sessions.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd ciphernest
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install or pnpm install
    ```

## Usage

1.  **Start the development server:**

    ```bash
    npm run dev # or yarn dev or pnpm dev
    ```

2.  **Open the application in your browser:**

    Navigate to the address provided by the development server (usually `http://localhost:5173`).

3.  **Create an account or log in:**

    Follow the on-screen instructions to set up your account or log in with existing credentials.

4.  **Generate your RSA key pair:**

    The application will guide you through generating your RSA key pair. This is crucial for encrypting and decrypting your passwords.  **Ensure you keep your private key secure!**

5.  **Start managing your passwords:**

    Add, edit, and delete your passwords, organizing them into categories for easy access.  All passwords are encrypted using your RSA public key.

## Features

*   **Secure Password Storage:** Passwords are encrypted using RSA encryption, ensuring confidentiality.
*   **RSA Key Management:** Generate, regenerate, export, and import your RSA key pairs securely.
*   **Password Generation:** Create strong, random passwords with customizable length and character sets.
*   **Categorization:** Organize passwords into custom categories for efficient management.
*   **Persistent Data Storage:** Password data and user settings are persisted across sessions using local storage.
*   **User Authentication:** Secure user authentication with login, registration, and logout functionality.
*   **Toast Notifications:**  Provides helpful notifications to guide the user through key operations and important system events.
*   **Responsive Design:**  Adaptable UI for various screen sizes and devices.

## Technologies Used

*   **Frontend:**
    *   **React:** A JavaScript library for building user interfaces.
    *   **TypeScript:** A superset of JavaScript that adds static typing.
    *   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
    *   **Radix UI:** A set of unstyled, accessible React primitives for building high-quality user interfaces.
    *   **Zustand:** A small, fast and scalable bearbones state-management solution.
    *   **Vite:** A build tool that aims to provide a faster and leaner development experience for modern web projects.
    *   **clsx:**  A tiny (228B) utility for constructing `className` strings conditionally and joining them with spaces.
    *   **tailwind-merge:**  A tiny utility that merges Tailwind CSS classes based on Tailwind's cascading order.
    *   **@hookform/resolvers:** A library for integrating form validation with React Hook Form.
    *   **@radix-ui/react-accordion:** An accessible accordion component from Radix UI.
    *   **@radix-ui/react-alert-dialog:** An accessible alert dialog component from Radix UI.
    *   **@radix-ui/react-aspect-ratio:** An accessible aspect ratio component from Radix UI.
    *   **@radix-ui/react-avatar:** An accessible avatar component from Radix UI.
    *   ... *[List other @radix-ui components and relevant dependencies here]* ...

*   **Styling:**
    *   **CSS:** Cascading Style Sheets for styling the web application.
    *   **PostCSS:** A tool for transforming CSS with plugins, including Tailwind CSS and Autoprefixer.

*   **Development Tools:**
    *   **ESLint:** A JavaScript and TypeScript linter for identifying and fixing code quality issues.

*   **State Management:**
    *   **Zustand:** A small, fast, and scalable bearbones state-management solution using simplified flux principles.

*   **Cryptography:**
    *   **RSA Encryption:** Used for secure password storage. (Implementation details not explicitly in provided files, but implied)

## Key Classes or Functions

*   **`useToast` (src\hooks\use-toast.ts):** A React hook for managing and displaying toast notifications.
*   **`toast` (src\hooks\use-toast.ts):** A function for triggering toast notifications.
*   **`cn` (src\lib\utils.ts):** A utility function for combining and merging CSS class names.
*   **`useAuthStore` (src\store\authStore.ts):** A Zustand store for managing authentication state (user, token, login/logout).
*   **`useCryptoStore` (src\store\cryptoStore.ts):** A Zustand store for managing RSA key pairs and related operations (generation, encryption, decryption).
*   **`usePasswordStore` (src\store\passwordStore.ts):** A Zustand store for managing passwords and categories.
