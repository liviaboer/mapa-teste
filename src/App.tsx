import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

type Ponto = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  avaliacoes: string[];
};

const pontoIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});

function LocalizarUsuario({ onLocalizar }: { onLocalizar: (lat: number, lng: number) => void }) {
  const map = useMap();

  const localizar = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 16);
        onLocalizar(latitude, longitude);
      },
      () => alert("Não foi possível obter sua localização")
    );
  };

  return (
    <button className="localizar-btn" onClick={localizar}>
      📍 Minha Localização
    </button>
  );
}

export default function App() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [usuarioPos, setUsuarioPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    const salvos = localStorage.getItem("pontos");
    if (salvos) {
      setPontos(JSON.parse(salvos));
    } else {
      const seed: Ponto[] = [
        { id: 1, nome: "Praça Central", lat: -23.5505, lng: -46.6333, avaliacoes: [] },
        { id: 2, nome: "Shopping Verde", lat: -23.5558, lng: -46.6396, avaliacoes: [] },
      ];
      setPontos(seed);
      localStorage.setItem("pontos", JSON.stringify(seed));
    }
  }, []);

  const salvarAvaliacao = (id: number, texto: string) => {
    const atualizado = pontos.map((p) =>
      p.id === id ? { ...p, avaliacoes: [texto, ...p.avaliacoes].slice(0, 2) } : p
    );
    setPontos(atualizado);
    localStorage.setItem("pontos", JSON.stringify(atualizado));
  };

  return (
    <div className="App">
      <h1>💧 ecoRefil</h1>
      <MapContainer center={[-23.5505, -46.6333]} zoom={14} style={{ height: "80vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <LocalizarUsuario onLocalizar={(lat, lng) => setUsuarioPos([lat, lng])} />

        {usuarioPos && (
          <Marker
            position={usuarioPos}
            icon={
              new L.Icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
                iconSize: [25, 25],
              })
            }
          >
            <Popup>Você está aqui!</Popup>
          </Marker>
        )}

        {pontos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pontoIcon}>
            <Popup>
              <strong>{p.nome}</strong>
              <ul>
                {p.avaliacoes.length === 0 ? (
                  <li>Sem avaliações</li>
                ) : (
                  p.avaliacoes.map((a, i) => <li key={i}>{a}</li>)
                )}
              </ul>
              <button
                onClick={() => {
                  const texto = prompt("Deixe sua avaliação (máx 30 caracteres):") || "";
                  if (texto.trim()) salvarAvaliacao(p.id, texto.slice(0, 30));
                }}
              >
                Avaliar
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
