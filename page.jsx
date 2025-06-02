
// Painel Inicial - Tela de Boas-Vindas com Calendário e Resumo do Dia
"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Head from 'next/head';

const localizer = momentLocalizer(moment);

export default function TelaInicial() {
  const [eventos, setEventos] = useState([]);
  const [recados, setRecados] = useState([]);

  useEffect(() => {
    async function carregarEventos() {
      const dados = await fetch("https://script.google.com/macros/s/AKfycbwht0y0BjKZWYBXKKBFIqih-M4UeKxbedsWfUWYzXbMf8vQ6f_QCxFLDL1c9CeumQc-tw/exec").then(r => r.json());
      const eventosFormatados = dados.map(ev => ({
        title: ev.titulo,
        start: new Date(ev.data),
        end: new Date(ev.data),
        allDay: true,
        tipo: ev.tipo
      }));
      setEventos(eventosFormatados);
    }

    async function carregarRecados() {
      const urls = [
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vOBS/public?output=csv",
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOL/public?output=csv",
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vPRO/public?output=csv"
      ];

      const todos = await Promise.all(urls.map(async url => {
        const texto = await fetch(url).then(r => r.text());
        return texto.split("\n").slice(1).map(l => {
          const [data, nome, etapa, observacao, usuario] = l.split(",");
          return { data, nome, etapa, observacao, usuario };
        });
      }));
      setRecados(todos.flat().slice(0, 5));
    }

    carregarEventos();
    carregarRecados();
  }, []);

  const corEvento = tipo => {
    switch (tipo) {
      case "Consulta": return "#007bff";
      case "Cirurgia": return "#28a745";
      case "Pessoal": return "#6f42c1";
      default: return "#ffc107";
    }
  };

  const eventosEstilizados = eventos.map(e => ({
    ...e,
    style: { backgroundColor: corEvento(e.tipo), color: "white" }
  }));

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>{\`
          body {
            font-family: 'Open Sans', sans-serif;
          }
        \`}</style>
      </Head>

      <div className="p-6 space-y-6 min-h-screen bg-[#f9fafb]">
        <h1 className="text-4xl font-bold text-center mb-6 text-[#1f2937]">📅 Visão Geral do Dia</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">Calendário de Compromissos</h2>
            <Calendar
              localizer={localizer}
              events={eventosEstilizados}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-600">📌 Últimos Recados</h2>
            <ul className="divide-y divide-gray-200">
              {recados.map((r, i) => (
                <li key={i} className="py-3">
                  <p className="text-sm text-gray-500">{r.data}</p>
                  <p className="text-lg font-semibold text-gray-800">{r.nome}</p>
                  <p className="text-sm italic text-gray-600">{r.etapa}</p>
                  <p className="text-sm text-gray-700">{r.observacao}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => window.location.href = "/painel"} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-lg shadow hover:bg-blue-700 transition-all">
            👉 Iniciar o Dia
          </button>
        </div>
      </div>
    </>
  );
}
