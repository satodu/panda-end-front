<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SaveStateController extends Controller
{
    /**
     * Save the game state (.sav) to the server disk.
     */
    public function save(Request $request): JsonResponse
    {
        $gameId = $request->input('gameId');
        $stateData = $request->input('stateData');

        if (!$gameId || !$stateData) {
            return response()->json([
                'success' => false,
                'message' => 'Parâmetros gameId e stateData são obrigatórios.'
            ], 400);
        }

        // Write the save state to local Laravel storage (storage/app/saves/{gameId}.sav)
        $fileName = 'saves/' . $gameId . '.sav';
        Storage::disk('local')->put($fileName, $stateData);

        return response()->json([
            'success' => true,
            'message' => 'Estado da emulação salvo com sucesso!'
        ]);
    }

    /**
     * Load the game state (.sav) from the server disk.
     */
    public function load(Request $request): JsonResponse
    {
        $gameId = $request->query('gameId');

        if (!$gameId) {
            return response()->json([
                'success' => false,
                'message' => 'O parâmetro gameId é obrigatório.'
            ], 400);
        }

        $fileName = 'saves/' . $gameId . '.sav';

        if (Storage::disk('local')->exists($fileName)) {
            $stateData = Storage::disk('local')->get($fileName);
            return response()->json([
                'success' => true,
                'stateData' => $stateData
            ]);
        }

        return response()->json([
            'success' => true,
            'stateData' => null,
            'message' => 'Nenhum save file localizado.'
        ]);
    }
}
