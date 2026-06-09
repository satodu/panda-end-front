import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Upload, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

export const SUPPORTED_SYSTEMS = [
  { value: '3do', label: '3DO' },
  { value: 'arcade', label: 'Arcade' },
  { value: 'atari2600', label: 'Atari 2600' },
  { value: 'atari5200', label: 'Atari 5200' },
  { value: 'atari7800', label: 'Atari 7800' },
  { value: 'jaguar', label: 'Atari Jaguar' },
  { value: 'lynx', label: 'Atari Lynx' },
  { value: 'colecovision', label: 'ColecoVision' },
  { value: 'c64', label: 'Commodore 64' },
  { value: 'c128', label: 'Commodore 128' },
  { value: 'amiga', label: 'Commodore Amiga' },
  { value: 'pet', label: 'Commodore PET' },
  { value: 'plus4', label: 'Commodore Plus4' },
  { value: 'vic20', label: 'Commodore VIC-20' },
  { value: 'mame2003', label: 'MAME 2003' },
  { value: 'nes', label: 'NES-Famicom' },
  { value: 'n64', label: 'Nintendo 64' },
  { value: 'nds', label: 'Nintendo DS' },
  { value: 'gba', label: 'Nintendo Game Boy Advance' },
  { value: 'gb', label: 'Nintendo Game Boy' },
  { value: 'psx', label: 'PlayStation' },
  { value: 'psp', label: 'PSP' },
  { value: 'sega32x', label: 'Sega 32X' },
  { value: 'segaCD', label: 'Sega CD' },
  { value: 'segaGG', label: 'Sega Game Gear' },
  { value: 'segaMS', label: 'Sega Master System' },
  { value: 'segaMD', label: 'Sega Mega Drive' },
  { value: 'segaSaturn', label: 'Sega Saturn' },
  { value: 'snes', label: 'SNES-Super Famicom' },
  { value: 'vb', label: 'Virtual Boy' }
];

interface ImportViewProps {
  onSuccess: (title: string) => void;
}

export default function ImportView({ onSuccess }: ImportViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Auto-detect title from filename (removing extension)
    const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
    setTitle(nameWithoutExt);

    // Auto-detect console system based on file extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sfc':
      case 'smc':
        setSystem('snes');
        break;
      case 'gba':
        setSystem('gba');
        break;
      case 'gb':
      case 'gbc':
        setSystem('gb');
        break;
      case 'nes':
        setSystem('nes');
        break;
      case 'md':
      case 'smd':
        setSystem('segaMD');
        break;
      case 'n64':
      case 'z64':
        setSystem('n64');
        break;
      case 'nds':
        setSystem('nds');
        break;
      case 'gg':
        setSystem('segaGG');
        break;
      case 'sms':
        setSystem('segaMS');
        break;
      case '32x':
        setSystem('sega32x');
        break;
      case 'pce':
        setSystem('pce');
        break;
      case 'vb':
        setSystem('vb');
        break;
      case 'ws':
      case 'wsc':
        setSystem('ws');
        break;
      case 'lnx':
        setSystem('lynx');
        break;
      case 'ngp':
      case 'ngc':
        setSystem('ngp');
        break;
      case 'a52':
        setSystem('atari5200');
        break;
      case 'col':
        setSystem('colecovision');
        break;
      case 'd64':
      case 't64':
      case 'crt':
        setSystem('c64');
        break;
      case 'adf':
        setSystem('amiga');
        break;
      case 'psp':
      case 'cso':
        setSystem('psp');
        break;
      default:
        setSystem('');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Por favor, selecione um arquivo de ROM.');
      return;
    }
    if (!title.trim()) {
      setError('Por favor, informe o título do jogo.');
      return;
    }
    if (!system) {
      setError('Por favor, selecione a plataforma da ROM.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('system', system);
    formData.append('rom_file', file);

    const getUserEmail = (): string => {
      const storedUser = localStorage.getItem('panda_end_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.email) {
            return parsed.email;
          }
        } catch (e) {}
      }
      return 'default';
    };

    try {
      const response = await fetch('/api/roms/import', {
        method: 'POST',
        headers: {
          'X-User-Email': getUserEmail(),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        const importedTitle = data.rom?.title || title || 'Jogo';
        setFile(null);
        setTitle('');
        setSystem('');
        // Trigger parent state update after short delay
        setTimeout(() => {
          onSuccess(importedTitle);
        }, 1000);
      } else {
        setError(data.message || 'Falha ao importar a ROM.');
      }
    } catch (err) {
      setError('Erro de rede ao tentar se comunicar com o backend Laravel.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1 animate-fade-in">
      
      {/* File Upload Box */}
      <div 
        onClick={triggerFileSelect}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          file 
            ? 'border-purple-500 bg-purple-950/10' 
            : 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".sfc,.smc,.gba,.gb,.gbc,.nes,.md,.bin,.smd,.n64,.z64,.nds,.gg,.sms,.32x,.pce,.vb,.ws,.wsc,.lnx,.ngp,.ngc"
          className="hidden"
          disabled={loading}
        />
        
        {file ? (
          <div className="space-y-2">
            <FileCode className="w-10 h-10 text-purple-400 mx-auto" />
            <p className="text-sm font-semibold text-zinc-200 truncate max-w-xs mx-auto">
              {file.name}
            </p>
            <span className="text-[10px] text-zinc-550 font-mono">
              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 text-zinc-500 mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">Arraste ou clique para selecionar a ROM</p>
            <p className="text-xs text-zinc-550">
              Formatos aceitos: .sfc, .gba, .nes, .md, .n64, .nds, .gb...
            </p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">Título do Jogo</label>
          <Input
            placeholder="Ex: Super Metroid"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* System Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">Plataforma / Console</label>
          <div className="relative">
            <select
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors duration-200 appearance-none cursor-pointer"
            >
              <option value="" className="text-zinc-650">Selecione um console...</option>
              {SUPPORTED_SYSTEMS.map((sys) => (
                <option key={sys.value} value={sys.value} className="bg-zinc-950 text-zinc-300">
                  {sys.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Status Notifications */}
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center space-x-2 text-red-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>ROM importada com sucesso! Atualizando biblioteca...</span>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading || success || !file}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 shadow-lg shadow-purple-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Salvando arquivos no HD...</span>
          </>
        ) : (
          <span>Adicionar à Biblioteca</span>
        )}
      </Button>

    </form>
  );
}
