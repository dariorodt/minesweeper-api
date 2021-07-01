<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameController extends Controller
{
    /**
     * Creeate a new instance of the class
     */
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // List all games from a logged user
        return response()->json(Game::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        // Create a new game
        //dd($request->all());

        $width = $request->width;
        $cells = $width * $width;
        $bomb_amount = $request->bombAmount;
        $bombs_array = array_fill(0, $bomb_amount, "bomb");
        $valid_array = array_fill(0, $cells - $bomb_amount, "valid");
        $grid = array_merge($bombs_array, $valid_array);
        shuffle($grid);
        $status = "active";
        $elapsed_time = "00:00";
        $user_id = "1";

        $game = new Game;

        $game->width = $width;
        $game->bomb_amount = $bomb_amount;
        $game->grid = json_encode($grid);
        $game->status = $status;
        $game->elapsed_time = $elapsed_time;
        $game->user_id = $user_id;

        $game->save();

        return response()->json($game);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Save a unfinished game into the database
        $game = new Game;
        $game->grid = json_encode($request->grid);
        $game->status = $request->status;
        $game->elapsed_time = $request->elapsed_time;
        $game->user_id = $request->user_id;
        $game->save();
        return response()->json($request->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function show(Game $game)
    {
        // Return the coresponding data for the given game Id
        return response()->json($game);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Game $game)
    {
        // Update the state of a saved game
        $game->grid = json_encode($request->grid);
        $game->status = $request->status;
        $game->elapsed_time = $request->elapsed_time;
        $game->user_id = $request->user_id;
        $game->save();
        return response()->json($request->all());
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Game  $game
     * @return \Illuminate\Http\Response
     */
    public function delete(Game $game)
    {
        $game->delete();
        return response()->json(["deleted" => true]);
    }
}
