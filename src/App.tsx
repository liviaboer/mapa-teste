import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
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

// Componente para adicionar pontos clicando no mapa
function AdicionarPonto({
  ativo,
  onAdicionar,
}: {
  ativo: boolean;
  onAdicionar: (lat: number, lng: number, nome: string) => void;
}) {
  useMapEvents({
    click(e) {
      if (ativo) {
        const nome = prompt("Digite o nome do novo ponto de água:");
        if (nome && nome.trim()) {
          onAdicionar(e.latlng.lat, e.latlng.lng, nome.trim());
        }
      }
    },
  });
  return null;
}

export default function App() {
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [usuarioPos, setUsuarioPos] = useState<[number, number] | null>(null);
  const [modoAdicionar, setModoAdicionar] = useState(false);

  useEffect(() => {
    const salvos = localStorage.getItem("pontos");
    if (salvos) {
      setPontos(JSON.parse(salvos));
    } else {
      const seed: Ponto[] = [
        { id: 1, nome: "Praça Central", lat: -23.5505, lng: -46.6333, avaliacoes: [] },
        { id: 2, nome: "Shopping Verde", lat: -23.5558, lng: -46.6396, avaliacoes: [] },
        { id: 3, nome: "Parque do Lago Azul", lat: -23.552, lng: -46.625, avaliacoes: [] },
        { id: 4, nome: "Universidade Sustentável", lat: -23.558, lng: -46.641, avaliacoes: [] },
        { id: 5, nome: "Praça da Liberdade", lat: -23.556, lng: -46.635, avaliacoes: [] },
        { id: 6, nome: "Shopping EcoLife", lat: -23.553, lng: -46.630, avaliacoes: [] },
        { id: 7, nome: "Centro Comunitário Verde", lat: -23.549, lng: -46.628, avaliacoes: [] },
        { id: 8, nome: "Clube dos Atletas", lat: -23.551, lng: -46.640, avaliacoes: [] },
        { id: 9, nome: "Praça das Flores", lat: -23.547, lng: -46.634, avaliacoes: [] },
        { id: 10, nome: "Escola Ambiental", lat: -23.554, lng: -46.638, avaliacoes: [] },
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

  const adicionarNovoPonto = (lat: number, lng: number, nome: string) => {
    const novo: Ponto = {
      id: Date.now(),
      nome,
      lat,
      lng,
      avaliacoes: [],
    };
    const atualizado = [...pontos, novo];
    setPontos(atualizado);
    localStorage.setItem("pontos", JSON.stringify(atualizado));
    setModoAdicionar(false);
    alert("✅ Ponto adicionado com sucesso!");
  };

  return (
    <div className="App">
      <h1>💧 ecoRefil</h1>
      <button
        className="adicionar-btn"
        onClick={() => {
          setModoAdicionar(!modoAdicionar);
          alert(modoAdicionar ? "Modo adicionar desativado" : "Clique no mapa para adicionar um ponto");
        }}
      >
        {modoAdicionar ? "❌ Cancelar" : "➕ Adicionar Ponto"}
      </button>

      <MapContainer center={[-23.5505, -46.6333]} zoom={14} style={{ height: "80vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <LocalizarUsuario onLocalizar={(lat, lng) => setUsuarioPos([lat, lng])} />

        <AdicionarPonto ativo={modoAdicionar} onAdicionar={adicionarNovoPonto} />

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
