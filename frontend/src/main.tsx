import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext';
import './index.css'

console.log('main.tsx loaded');
const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Creating root and rendering App');
  createRoot(rootElement).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} else {
  console.error('Root element not found!');
}
