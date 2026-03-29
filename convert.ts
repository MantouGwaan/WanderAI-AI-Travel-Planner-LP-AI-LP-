import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.error("No body found");
  process.exit(1);
}
let body = bodyMatch[1];

// Extract script content
const scriptMatch = body.match(/<script>([\s\S]*?)<\/script>/i);
let scriptContent = scriptMatch ? scriptMatch[1] : '';

// Remove script tags from body
body = body.replace(/<script[\s\S]*?<\/script>/gi, '');

// We will create a React component that uses dangerouslySetInnerHTML
const reactCode = `
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css'; // We will create this

export default function Welcome() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Attach click listeners to CTA buttons
    const ctaButtons = ["nav-cta", "hero-cta", "footer-cta"];
    ctaButtons.forEach(id => {
      const btn = containerRef.current?.querySelector(\`#\${id}\`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          navigate('/preferences');
        });
      }
    });

    // The rest of the script logic
    ${scriptContent.replace(/document\.addEventListener\("DOMContentLoaded", function \(\) {/g, '').replace(/}\);/g, '')}

    return () => {
      // Cleanup if necessary
      if (demoTimer) clearInterval(demoTimer);
    };
  }, [navigate]);

  return (
    <div 
      className="landing-page overflow-x-hidden"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: \`${body.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }}
    />
  );
}
`;

fs.writeFileSync('src/pages/Welcome.tsx', reactCode);

// Extract CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
let styleContent = styleMatch ? styleMatch[1] : '';

// We need to scope the body styles to .landing-page
styleContent = styleContent.replace(/body \{/g, '.landing-page {');
styleContent = styleContent.replace(/html \{/g, '.landing-page-html {');

fs.writeFileSync('src/pages/Landing.css', styleContent);

console.log("Conversion complete");
