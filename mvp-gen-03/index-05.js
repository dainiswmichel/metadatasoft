function toggleSidebar(side) {
    const sidebar = document.getElementById(`sidebar-${side}`);
    sidebar.classList.toggle("collapsed");

    const mainContent = document.querySelector(".main-content");
    if (sidebar.classList.contains("collapsed")) {
        mainContent.style.marginLeft = side === "left" ? "100px" : mainContent.style.marginLeft;
        mainContent.style.marginRight = side === "right" ? "100px" : mainContent.style.marginRight;
    } else {
        mainContent.style.marginLeft = "270px";
        mainContent.style.marginRight = "270px";
    }
}
