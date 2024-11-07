<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $shopName = $_POST["shopName"];
    $itemName = $_POST["itemName"];
    $itemPrice = $_POST["itemPrice"];
    $itemMedia = $_FILES["itemMedia"];

    $targetDir = __DIR__ . "/items/$shopName";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $targetFile = $targetDir . "/" . basename($itemMedia["name"]);
    if (move_uploaded_file($itemMedia["tmp_name"], $targetFile)) {
        echo json_encode(["status" => "success", "message" => "Item saved successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to save item"]);
    }
}
?>
