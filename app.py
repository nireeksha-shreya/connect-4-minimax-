from flask import Flask, render_template, request, jsonify
import numpy as np
import math
import random
from game import *

app = Flask(__name__)

board = create_board()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/move", methods=["POST"])
def move():
    global board
    data = request.get_json()
    col = int(data["column"])

    if not is_valid_location(board, col):
        return jsonify({
            "board": board.tolist(),
            "status": None,
            "ai_turn": False
        })

    row = get_next_open_row(board, col)
    drop_piece(board, row, col, PLAYER)

    if winning_move(board, PLAYER):
        return jsonify({
            "board": board.tolist(),
            "status": "Player Wins!",
            "ai_turn": False
        })

    return jsonify({
        "board": board.tolist(),
        "status": None,
        "ai_turn": True
    })


@app.route("/ai_move", methods=["POST"])
def ai_move():
    global board

    valid_locations = get_valid_locations(board)

    if len(valid_locations) == 0:
        return jsonify({
            "board": board.tolist(),
            "status": "Draw!"
        })

    col_ai, _ = minimax(board, 4, -math.inf, math.inf, True)

    if col_ai is None:
        col_ai = random.choice(valid_locations)

    row = get_next_open_row(board, col_ai)
    drop_piece(board, row, col_ai, AI)

    if winning_move(board, AI):
        return jsonify({
            "board": board.tolist(),
            "status": "AI Wins!"
        })

    return jsonify({
        "board": board.tolist(),
        "status": None
    })


@app.route("/reset", methods=["POST"])
def reset():
    global board
    board = create_board()
    return jsonify({
        "board": board.tolist()
    })


if __name__ == "__main__":
    app.run(debug=True)
