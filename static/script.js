document.addEventListener('DOMContentLoaded', () => {

});


function ShowPage(page, section){
    const children = Array.from(document.querySelector(page).children);
    children.forEach(child => {
        child.style.display = 'none';
    })
    document.querySelector(section).style.display = 'block';
}


