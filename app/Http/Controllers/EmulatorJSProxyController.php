<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\JsonResponse;

class EmulatorJSProxyController extends Controller
{
    /**
     * Intercepts EmulatorJS requests, downloads from CDN on-demand,
     * and saves locally in public/emulatorjs/ for offline play.
     */
    public function proxy(string $path): BinaryFileResponse|JsonResponse
    {
        // Path in public directory
        $localFilePath = public_path('emulatorjs/' . $path);

        // Serve local file if it exists (fallback if server didn't catch it statically)
        if (file_exists($localFilePath)) {
            return response()->file($localFilePath, [
                'Access-Control-Allow-Origin' => '*',
            ]);
        }

        // CDN URL
        $cdnUrl = 'https://cdn.emulatorjs.org/stable/data/' . $path;

        try {
            // Fetch from CDN
            $response = Http::withHeaders([
                'User-Agent' => 'PandaEnd/1.0'
            ])->get($cdnUrl);

            if ($response->failed()) {
                return response()->json(['message' => 'Arquivo do emulador nao encontrado na CDN: ' . $path], 404);
            }

            // Ensure directory exists
            $dir = dirname($localFilePath);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            // Save file content locally
            file_put_contents($localFilePath, $response->body());

            // Determine appropriate content type based on extension
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            $contentType = $response->header('Content-Type') ?: 'application/octet-stream';
            
            if ($extension === 'wasm') {
                $contentType = 'application/wasm';
            } elseif ($extension === 'js') {
                $contentType = 'application/javascript';
            } elseif ($extension === 'css') {
                $contentType = 'text/css';
            }

            // Serve the newly cached file
            return response()->file($localFilePath, [
                'Access-Control-Allow-Origin' => '*',
                'Content-Type' => $contentType,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao baixar arquivo do emulador: ' . $e->getMessage()], 500);
        }
    }
}
