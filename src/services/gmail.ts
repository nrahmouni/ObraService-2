/**
 * ObraService - Gmail API Integration Service
 * Manages Google OAuth access tokens in-memory, structures RFC 822 emails,
 * and interfaces with the Google Gmail API or simulates beautifully in Demo Mode.
 */

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// In-memory token cache to comply with Least Privilege and Security Guidelines
let gmailAccessToken: string | null = null;

// Track if a real Gmail account is connected
let isGmailConnected = false;

// Store sent invitations log dynamically in-memory for the session (to show in UI)
export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  isSimulated: boolean;
}

const sentEmailsRegistry: SentEmailLog[] = [];

export function getSentEmailsLog(): SentEmailLog[] {
  return sentEmailsRegistry;
}

export function isGoogleGmailConnected(): boolean {
  return isGmailConnected || !!gmailAccessToken;
}

export function setGmailAccessToken(token: string | null) {
  gmailAccessToken = token;
  isGmailConnected = !!token;
}

export function getGmailAccessToken(): string | null {
  return gmailAccessToken;
}

/**
 * Initiates Gmail-scoped Google OAuth sign-in to retrieve a bearer token client-side
 */
export async function connectGmailAccount(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Add Gmail send/compose scopes to the provider
    googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
    googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
    googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');

    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google.');
    }

    gmailAccessToken = credential.accessToken;
    isGmailConnected = true;
    return { success: true, token: gmailAccessToken };
  } catch (error: any) {
    console.error('Error connecting Google/Gmail account:', error);
    return { success: false, error: error.message || 'Error de autenticación con Google' };
  }
}

export function disconnectGmail() {
  gmailAccessToken = null;
  isGmailConnected = false;
}

/**
 * Encodes the email into RFC 822 base64url format for the Gmail send API
 */
export function buildRawEmail(to: string, subject: string, bodyHtml: string): string {
  // Use robust unescape-encodeURIComponent pattern for perfect UTF-8 support in btoa
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    bodyHtml
  ];
  
  const emailStr = emailLines.join('\r\n');
  const base64 = btoa(unescape(encodeURIComponent(emailStr)));
  
  // Convert standard base64 to base64url safe string
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Sends an email using the real Gmail API or simulates if no credentials are connected.
 * Supports explicit confirmation dialog check.
 */
export async function sendGmailEmail(
  to: string, 
  subject: string, 
  bodyHtml: string,
  forceReal = false
): Promise<{ success: boolean; isSimulated: boolean; error?: string }> {
  
  const token = getGmailAccessToken();

  if (!token || !isGmailConnected) {
    if (forceReal) {
      return { success: false, isSimulated: false, error: 'Cuenta de Gmail no conectada.' };
    }
    
    // Simulate sending in Demo/Mock Mode to provide instant UI feedback
    const simulatedLog: SentEmailLog = {
      id: `mail_${Date.now()}`,
      to,
      subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      isSimulated: true
    };
    sentEmailsRegistry.unshift(simulatedLog);
    
    // Artificial slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, isSimulated: true };
  }

  try {
    const rawContent = buildRawEmail(to, subject, bodyHtml);
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: rawContent
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gmail API responded with status ${response.status}`);
    }

    const realLog: SentEmailLog = {
      id: `mail_${Date.now()}`,
      to,
      subject,
      body: bodyHtml,
      sentAt: new Date().toISOString(),
      isSimulated: false
    };
    sentEmailsRegistry.unshift(realLog);

    return { success: true, isSimulated: false };
  } catch (error: any) {
    console.error('Error sending email via Gmail API:', error);
    return { success: false, isSimulated: false, error: error.message || 'Error al enviar por Gmail' };
  }
}

/**
 * Standard templates for sending invitations and contact forms
 */
export const GMAIL_TEMPLATES = {
  invitation: (companyName: string, inviteCode: string, invitedBy: string, roleLabel: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1E293B; background-color: #FAFAFA;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 900; color: #FF6600; letter-spacing: -0.5px;">ObraService</span>
        <div style="font-size: 10px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Control de Operarios y Subcontratas</div>
      </div>
      
      <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 0; margin-bottom: 20px; text-transform: uppercase; letter-spacing: -0.3px;">Invitación de Acceso</h1>
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          Hola, <br/><br/>
          <strong>${invitedBy}</strong> te ha invitado a unirte a la empresa <strong>${companyName}</strong> en ObraService con el rol de <strong>${roleLabel}</strong>.
        </p>
        
        <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;">
          <span style="font-size: 10px; font-weight: bold; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Código de Invitación Directo</span>
          <span style="font-family: monospace; font-size: 22px; font-weight: 800; color: #FF6600; letter-spacing: 1px;">${inviteCode}</span>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #64748B; margin-bottom: 30px;">
          Para unirte, accede a la aplicación, inicia sesión o regístrate y utiliza este código de invitación en la configuración de incorporación.
        </p>
        
        <div style="text-align: center;">
          <a href="${window.location.origin}" style="background-color: #0F172A; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 8px; display: inline-block; transition: background-color 0.2s;">Acceder a ObraService</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94A3B8;">
        Este es un correo automático enviado por ObraService en representación de ${companyName}.
      </div>
    </div>
  `,
  
  contactSupport: (name: string, email: string, subject: string, message: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1E293B; background-color: #FAFAFA;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 900; color: #FF6600; letter-spacing: -0.5px;">ObraService</span>
        <div style="font-size: 10px; font-weight: bold; color: #64748B; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Contacto de Soporte</div>
      </div>
      
      <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <h1 style="font-size: 18px; font-weight: 800; color: #0F172A; margin-top: 0; margin-bottom: 24px; text-transform: uppercase; letter-spacing: -0.3px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">Nuevo Mensaje Recibido</h1>
        
        <div style="margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: bold; color: #94A3B8; text-transform: uppercase; display: block; margin-bottom: 4px;">Remitente</span>
          <span style="font-size: 14px; font-weight: bold; color: #0F172A;">${name} &lt;${email}&gt;</span>
        </div>
        
        <div style="margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: bold; color: #94A3B8; text-transform: uppercase; display: block; margin-bottom: 4px;">Asunto</span>
          <span style="font-size: 14px; font-weight: bold; color: #0F172A;">${subject}</span>
        </div>
        
        <div style="margin-bottom: 24px;">
          <span style="font-size: 11px; font-weight: bold; color: #94A3B8; text-transform: uppercase; display: block; margin-bottom: 6px;">Mensaje</span>
          <div style="font-size: 13px; line-height: 1.6; color: #334155; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; white-space: pre-wrap;">${message}</div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #94A3B8;">
        Formulario de contacto oficial - ObraService 2026.
      </div>
    </div>
  `
};
