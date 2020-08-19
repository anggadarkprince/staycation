export const scrollToTarget = (targetId, headerOffset = 20) => {
    const element = document.getElementById(targetId);
    const offsetPosition = element.offsetTop - headerOffset;

    //document.getElementById(targetId).scrollIntoView({behavior: 'smooth'});
    window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
    });
}

export const backToTop = () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}
