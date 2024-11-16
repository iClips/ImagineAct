session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $_SESSION["username"] = $_POST["username"];
    $_SESSION["balance"] = $_POST["balance"];
}

// Retrieve session data
$username = $_SESSION["username"] ?? 'Guest';
$balance = $_SESSION["balance"] ?? 0;
