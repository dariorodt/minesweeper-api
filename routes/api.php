<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('games')->group(function () {
    Route::get('/', [App\Http\Controllers\GameController::class, 'index']);
    Route::get('/{game}', [App\Http\Controllers\GameController::class, 'show']);
    Route::post('/create', [App\Http\Controllers\GameController::class, 'create']);
    Route::put("/update/{game}", [App\Http\Controllers\GameController::class, 'update']);
    Route::delete("/delete/{game}", [App\Http\Controllers\GameController::class, 'delete']);
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});
