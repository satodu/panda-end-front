<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ROMController;
use App\Http\Controllers\SaveStateController;
use App\Http\Controllers\EmulatorJSProxyController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/roms', [ROMController::class, 'index']);
Route::post('/api/roms/import', [ROMController::class, 'import']);
Route::delete('/api/roms/{id}', [ROMController::class, 'destroy']);
Route::get('/roms/file/{id}', [ROMController::class, 'serveFile']);
Route::post('/api/saves/save', [SaveStateController::class, 'save']);
Route::get('/api/saves/load', [SaveStateController::class, 'load']);
Route::get('/emulatorjs/{path}', [EmulatorJSProxyController::class, 'proxy'])->where('path', '.*');
