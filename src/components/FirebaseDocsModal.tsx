import React, { useState } from 'react';
import { 
  FileCode2, 
  Database, 
  ShieldCheck, 
  Globe, 
  Copy, 
  Check, 
  Server, 
  Terminal, 
  Layers, 
  Cpu,
  Mail,
  Zap
} from 'lucide-react';

export const FirebaseDocsModal: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar si es Administrador
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == "admin@tuntunstore.com" ||
        request.auth.token.admin == true
      );
    }
    
    // Colección de Usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }
    
    // Colección del Catálogo de Productos (Público para lectura, Escritura solo Admin)
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Colección de Pedidos (Clientes crean sus pedidos, Admin gestiona todo)
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.userEmail == request.auth.token.email || isAdmin()
      );
      allow update, delete: if isAdmin();
    }
    
    // Cuentas Bancarias (Lectura pública, edición solo Admin)
    match /bank_accounts/{accountId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}`;

  const databaseSchemaJson = `{
  "collections": {
    "products": {
      "doc_id": "dia-572",
      "fields": {
        "name": "572 Diamantes",
        "diamonds": 572,
        "bonusDiamonds": 57,
        "priceUSD": 5.80,
        "category": "diamonds", // 'diamonds' | 'passes' | 'memberships' | 'promos'
        "isGoldPromo": false,
        "badgeText": "MÁS VENDIDO ⚡",
        "active": true
      }
    },
    "orders": {
      "doc_id": "TTS-84920",
      "fields": {
        "id": "TTS-84920",
        "date": "2026-08-03 14:22:10",
        "userEmail": "cliente@gmail.com",
        "userName": "Mateo Cárdenas",
        "playerId": "284910293",
        "productId": "dia-572",
        "productName": "572 Diamantes (+57 extra)",
        "diamondsTotal font": 629,
        "priceUSD": 5.80,
        "bankName": "Banco Pichincha",
        "receiptUrl": "https://firebasestorage.googleapis.com/.../baucher.jpg",
        "status": "Pendiente", // 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado'
        "createdAt": "Timestamp"
      }
    }
  }
}`;

  return (
    <section id="firebase-docs-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-white">
      
      {/* Title */}
      <div className="bg-zinc-900/80 text-white p-6 rounded-2xl border border-amber-500/30 space-y-2 shadow-2xl">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-amber-400/30">
          <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
          <span>ENTREGABLES DE ARQUITECTURA & BASE DE DATOS</span>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Documentación e Infraestructura TunTun Store</h1>
        <p className="text-xs text-zinc-400 font-semibold uppercase">
          Requerimientos para el despliegue en Firebase Hosting (`tuntunstore-ec.web.app`), Firestore NoSQL y Reglas de Seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deliverable 1: Tech Stack & Architecture */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider border-b border-white/10 pb-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>1. Arquitectura & Stack Tecnológico</span>
          </div>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 bg-black rounded-xl border border-white/10">
              <p className="font-black text-white uppercase">Frontend UI/UX:</p>
              <p className="font-medium text-zinc-400 mt-0.5">React 19, TypeScript, Vite & Tailwind CSS v4 con paleta Verde Esmeralda, Negro, Blanco y Dorado para promociones.</p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10">
              <p className="font-black text-white uppercase">Autenticación Exclusiva:</p>
              <p className="font-medium text-zinc-400 mt-0.5">Firebase Authentication configurado únicamente con Google Provider para clientes y acceso administrativo.</p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10">
              <p className="font-black text-white uppercase">Base de Datos & Almacenamiento:</p>
              <p className="font-medium text-zinc-400 mt-0.5">Cloud Firestore (NoSQL) para almacenamiento de productos y pedidos en tiempo real. Firebase Storage para comprobantes baucher.</p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10">
              <p className="font-black text-white uppercase">Hosting Gratuito SSL:</p>
              <p className="font-medium text-zinc-400 mt-0.5">Dominio en Firebase Hosting: <code className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">tuntunstore-ec.web.app</code></p>
            </div>
          </div>
        </div>

        {/* Deliverable 2: Database Schema */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>2. Esquema Firestore NoSQL</span>
            </div>
            <button
              onClick={() => handleCopyCode(databaseSchemaJson, 'schema')}
              className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-black text-xs uppercase flex items-center gap-1 border border-emerald-500/30 transition-all cursor-pointer"
            >
              {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar JSON</span>
            </button>
          </div>

          <pre className="bg-black text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64 border border-white/10 leading-relaxed">
            {databaseSchemaJson}
          </pre>
        </div>

      </div>

      {/* Deliverable 3: Firestore Security Rules Code */}
      <div className="bg-zinc-900/60 p-6 rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>3. Reglas de Seguridad de Firestore (Panel Admin)</span>
          </div>
          <button
            onClick={() => handleCopyCode(firestoreRulesCode, 'rules')}
            className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-black text-xs uppercase flex items-center gap-1 border border-amber-400/30 transition-all cursor-pointer"
          >
            {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Reglas</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 font-semibold uppercase">
          Estas reglas aseguran que solo la cuenta de correo <strong className="text-white">admin@tuntunstore.com</strong> pueda modificar el catálogo y cambiar los estados de los pedidos.
        </p>

        <pre className="bg-black text-amber-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-white/10 leading-relaxed">
          {firestoreRulesCode}
        </pre>
      </div>

    </section>
  );
};
