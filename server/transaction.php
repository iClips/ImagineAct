<?php
include 'db.php';
session_start();

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    $category = $_POST['category'];
    $item = $_POST['item'];
    $amount = $_POST['amount'];

    // Update balance
    $stmt = $pdo->prepare('UPDATE users SET balance = balance - ? WHERE id = ?');
    $stmt->execute([$amount, $user_id]);

    // Log transaction
    $stmt = $pdo->prepare('INSERT INTO transactions (user_id, category, item, amount) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user_id, $category, $item, $amount]);

    // Fetch updated balance
    $stmt = $pdo->prepare('SELECT balance FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $balance = $stmt->fetchColumn();

    echo json_encode(['balance' => $balance]);
} else {
    echo 'User not logged in!';
}
?>
