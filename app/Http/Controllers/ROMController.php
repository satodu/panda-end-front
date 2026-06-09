<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ROMController extends Controller
{
    private function getMetadataFile(Request $request): string
    {
        $userEmail = $request->header('X-User-Email') ?: 'default';
        $safeEmail = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $userEmail);
        $newPath = 'roms/metadata_' . $safeEmail . '.json';
        
        // Migrate legacy file for default/anonymous user
        if ($safeEmail === 'default' && !Storage::disk('local')->exists($newPath) && Storage::disk('local')->exists('roms/metadata.json')) {
            Storage::disk('local')->copy('roms/metadata.json', $newPath);
        }
        
        return $newPath;
    }

    /**
     * Get list of all imported ROMs from the local JSON database.
     */
    public function index(Request $request): JsonResponse
    {
        $metadataFile = $this->getMetadataFile($request);
        
        if (!Storage::disk('local')->exists($metadataFile)) {
            return response()->json([]);
        }

        try {
            $content = Storage::disk('local')->get($metadataFile);
            $roms = json_decode($content, true) ?: [];
            
            // Remove filePath from output to keep API clean
            $cleanRoms = array_map(function ($rom) {
                unset($rom['filePath']);
                return $rom;
            }, $roms);

            return response()->json(array_values($cleanRoms));
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    /**
     * Import a new ROM file, saving it and updating metadata.
     */
    public function import(Request $request): JsonResponse
    {
        $rules = [
            'title' => 'required|string|max:100',
            'system' => 'required|string|in:3do,arcade,atari2600,atari5200,atari7800,jaguar,lynx,colecovision,c64,c128,amiga,pet,plus4,vic20,mame2003,nes,n64,nds,gba,gb,psx,psp,sega32x,segaCD,segaGG,segaMS,segaMD,segaSaturn,snes,vb',
        ];

        if ($request->has('temp_file_path')) {
            $rules['temp_file_path'] = 'required|string';
            $rules['rom_file'] = 'required|string'; // Filename
        } else {
            $rules['rom_file'] = 'required|file';
        }

        $request->validate($rules);

        $title = $request->input('title');
        $system = $request->input('system');

        $userEmail = $request->header('X-User-Email') ?: 'default';
        $safeEmail = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $userEmail);

        if ($request->has('temp_file_path') && file_exists($request->input('temp_file_path'))) {
            $tempPath = $request->input('temp_file_path');
            $fileName = basename($tempPath);
            // Create an UploadedFile mock from local path to copy via Laravel Storage
            $uploadedFile = new \Illuminate\Http\UploadedFile($tempPath, $fileName, null, null, true);
            $storedPath = Storage::disk('local')->putFile('roms/files/' . $safeEmail, $uploadedFile);
            // Clean up the temp file
            @unlink($tempPath);
        } else {
            $file = $request->file('rom_file');
            $storedPath = Storage::disk('local')->putFile('roms/files/' . $safeEmail, $file);
        }

        if (!$storedPath) {
            return response()->json([
                'success' => false,
                'message' => 'Falha ao salvar o arquivo da ROM no servidor.'
            ], 500);
        }

        // Generate nice gradient and default cover image based on system
        $systemMap = [
            'snes' => [
                'gradient' => 'from-red-600 to-yellow-600',
                'coverFile' => 'snes.jpg',
                'label' => 'SNES-Super Famicom'
            ],
            'gba' => [
                'gradient' => 'from-emerald-600 to-green-500',
                'coverFile' => 'gba.jpg',
                'label' => 'Nintendo Game Boy Advance'
            ],
            'gb' => [
                'gradient' => 'from-lime-600 to-emerald-500',
                'coverFile' => 'gb.jpg',
                'label' => 'Nintendo Game Boy'
            ],
            'nes' => [
                'gradient' => 'from-blue-600 to-cyan-500',
                'coverFile' => 'nes.jpg',
                'label' => 'NES-Famicom'
            ],
            'psx' => [
                'gradient' => 'from-zinc-600 to-slate-500',
                'coverFile' => 'psx.jpg',
                'label' => 'PlayStation'
            ],
            'psp' => [
                'gradient' => 'from-blue-700 to-zinc-700',
                'coverFile' => 'psp.jpg',
                'label' => 'PSP'
            ],
            'arcade' => [
                'gradient' => 'from-pink-600 to-rose-500',
                'coverFile' => 'arcade.jpg',
                'label' => 'Arcade'
            ],
            'nds' => [
                'gradient' => 'from-teal-600 to-cyan-500',
                'coverFile' => 'nds.jpg',
                'label' => 'Nintendo DS'
            ],
            'n64' => [
                'gradient' => 'from-amber-600 to-red-500',
                'coverFile' => 'n64.jpg',
                'label' => 'Nintendo 64'
            ],
            'sega32x' => [
                'gradient' => 'from-violet-600 to-purple-500',
                'coverFile' => '32x.jpg',
                'label' => 'Sega 32X'
            ],
            'segacd' => [
                'gradient' => 'from-fuchsia-600 to-purple-500',
                'coverFile' => 'segacd.jpg',
                'label' => 'Sega CD'
            ],
            'segagg' => [
                'gradient' => 'from-indigo-600 to-blue-500',
                'coverFile' => 'gamegear.jpg',
                'label' => 'Sega Game Gear'
            ],
            'segams' => [
                'gradient' => 'from-blue-600 to-indigo-500',
                'coverFile' => 'master.jpg',
                'label' => 'Sega Master System'
            ],
            'segamd' => [
                'gradient' => 'from-indigo-600 to-purple-500',
                'coverFile' => 'megadrive.jpg',
                'label' => 'Sega Mega Drive'
            ],
            'segasaturn' => [
                'gradient' => 'from-slate-700 to-zinc-600',
                'coverFile' => 'saturn.jpg',
                'label' => 'Sega Saturn'
            ],
            '3do' => [
                'gradient' => 'from-stone-600 to-neutral-500',
                'coverFile' => '3do.jpg',
                'label' => '3DO'
            ],
            'atari2600' => [
                'gradient' => 'from-orange-700 to-yellow-700',
                'coverFile' => 'atari2600.jpg',
                'label' => 'Atari 2600'
            ],
            'atari5200' => [
                'gradient' => 'from-amber-600 to-yellow-600',
                'coverFile' => 'atari5200.jpg',
                'label' => 'Atari 5200'
            ],
            'atari7800' => [
                'gradient' => 'from-amber-700 to-orange-600',
                'coverFile' => 'atari7800.jpg',
                'label' => 'Atari 7800'
            ],
            'jaguar' => [
                'gradient' => 'from-red-800 to-orange-700',
                'coverFile' => 'jaguar.jpg',
                'label' => 'Atari Jaguar'
            ],
            'lynx' => [
                'gradient' => 'from-amber-600 to-yellow-600',
                'coverFile' => 'lynx.jpg',
                'label' => 'Atari Lynx'
            ],
            'colecovision' => [
                'gradient' => 'from-neutral-700 to-slate-600',
                'coverFile' => 'coleco.jpg',
                'label' => 'ColecoVision'
            ],
            'c64' => [
                'gradient' => 'from-yellow-700 to-orange-700',
                'coverFile' => 'c64.jpg',
                'label' => 'Commodore 64'
            ],
            'c128' => [
                'gradient' => 'from-amber-700 to-orange-600',
                'coverFile' => 'c64.jpg',
                'label' => 'Commodore 128'
            ],
            'amiga' => [
                'gradient' => 'from-red-600 to-pink-600',
                'coverFile' => 'amiga.jpg',
                'label' => 'Commodore Amiga'
            ],
            'pet' => [
                'gradient' => 'from-green-700 to-teal-600',
                'coverFile' => 'default.jpg',
                'label' => 'Commodore PET'
            ],
            'plus4' => [
                'gradient' => 'from-cyan-700 to-sky-600',
                'coverFile' => 'default.jpg',
                'label' => 'Commodore Plus4'
            ],
            'vic20' => [
                'gradient' => 'from-emerald-700 to-lime-600',
                'coverFile' => 'default.jpg',
                'label' => 'Commodore VIC-20'
            ],
            'mame2003' => [
                'gradient' => 'from-indigo-700 to-blue-600',
                'coverFile' => 'mame.jpg',
                'label' => 'MAME 2003'
            ],
            'msx' => [
                'gradient' => 'from-cyan-700 to-teal-600',
                'coverFile' => 'msx.jpg',
                'label' => 'MSX'
            ],
            'ngp' => [
                'gradient' => 'from-emerald-700 to-teal-500',
                'coverFile' => 'ngp.jpg',
                'label' => 'Neo Geo Pocket'
            ],
            'pce' => [
                'gradient' => 'from-purple-700 to-pink-600',
                'coverFile' => 'tg16.jpg',
                'label' => 'TurboGrafx-16 | PC Engine'
            ],
            'vb' => [
                'gradient' => 'from-red-900 to-red-700',
                'coverFile' => 'virtualboy.jpg',
                'label' => 'Virtual Boy'
            ],
            'ws' => [
                'gradient' => 'from-pink-600 to-purple-500',
                'coverFile' => 'ws.jpg',
                'label' => 'WonderSwan | Color'
            ],
        ];

        $sysLower = strtolower($system);
        $visual = $systemMap[$sysLower] ?? [
            'gradient'  => 'from-purple-700 to-indigo-700',
            'coverFile' => 'default.jpg',
            'label'     => strtoupper($system),
        ];

        $gradient = $visual['gradient'];
        $coverUrl = "/capas/" . $visual['coverFile'];
        $systemLabel = $visual['label'];

        // Load existing metadata
        $roms = [];
        $metadataFile = $this->getMetadataFile($request);
        if (Storage::disk('local')->exists($metadataFile)) {
            $content = Storage::disk('local')->get($metadataFile);
            $roms = json_decode($content, true) ?: [];
        }

        $id = 'rom_' . uniqid();

        // Create new ROM entry
        $newRom = [
            'id' => $id,
            'title' => $title,
            'system' => $system, // the slug
            'systemLabel' => $systemLabel, // nice display label
            'romUrl' => "/roms/file/{$id}",
            'coverUrl' => $coverUrl,
            'gradient' => $gradient,
            'lastPlayed' => 'Nunca jogado',
            'filePath' => $storedPath, // Saved locally to fetch it later
        ];

        $roms[$id] = $newRom;

        // Save metadata back
        Storage::disk('local')->put($metadataFile, json_encode($roms, JSON_PRETTY_PRINT));

        return response()->json([
            'success' => true,
            'message' => 'ROM importada com sucesso!',
            'rom' => [
                'id' => $id,
                'title' => $title,
                'system' => $system,
                'systemLabel' => $systemLabel,
                'romUrl' => $newRom['romUrl'],
            ]
        ]);
    }

    /**
     * Serve the raw ROM file binary to the WebView/EmulatorJS player.
     */
    public function serveFile(string $id): BinaryFileResponse|JsonResponse
    {
        // Find the ROM metadata by scanning all metadata files
        $rom = null;
        $files = Storage::disk('local')->files('roms');
        foreach ($files as $file) {
            if (str_starts_with(basename($file), 'metadata_') && str_ends_with($file, '.json')) {
                $content = Storage::disk('local')->get($file);
                $roms = json_decode($content, true) ?: [];
                if (isset($roms[$id])) {
                    $rom = $roms[$id];
                    break;
                }
            }
        }
        
        // Fallback for legacy files
        if (!$rom && Storage::disk('local')->exists('roms/metadata.json')) {
            $content = Storage::disk('local')->get('roms/metadata.json');
            $roms = json_decode($content, true) ?: [];
            if (isset($roms[$id])) {
                $rom = $roms[$id];
            }
        }

        if (!$rom) {
            return response()->json(['message' => 'ROM não encontrada.'], 404);
        }

        $filePath = Storage::disk('local')->path($rom['filePath']);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Arquivo físico da ROM não localizado.'], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => 'application/octet-stream',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }

    /**
     * Delete a ROM file and associated save file from disk.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $metadataFile = $this->getMetadataFile($request);
        if (!Storage::disk('local')->exists($metadataFile)) {
            return response()->json(['success' => false, 'message' => 'Nenhuma ROM encontrada.'], 404);
        }

        try {
            $content = Storage::disk('local')->get($metadataFile);
            $roms = json_decode($content, true) ?: [];

            if (!isset($roms[$id])) {
                return response()->json(['success' => false, 'message' => 'ROM não encontrada.'], 404);
            }

            $rom = $roms[$id];
            
            // Delete raw ROM file from storage
            if (isset($rom['filePath']) && Storage::disk('local')->exists($rom['filePath'])) {
                Storage::disk('local')->delete($rom['filePath']);
            }

            // Delete associated save file if it exists
            $userEmail = $request->header('X-User-Email') ?: 'default';
            $safeEmail = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $userEmail);
            $saveFile = 'saves/' . $safeEmail . '/' . $id . '.sav';
            if (Storage::disk('local')->exists($saveFile)) {
                Storage::disk('local')->delete($saveFile);
            }

            // Remove entry from metadata array
            unset($roms[$id]);
            Storage::disk('local')->put($metadataFile, json_encode($roms, JSON_PRETTY_PRINT));

            return response()->json([
                'success' => true,
                'message' => 'Jogo removido com sucesso!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deletar o jogo: ' . $e->getMessage()
            ], 500);
        }
    }
}
