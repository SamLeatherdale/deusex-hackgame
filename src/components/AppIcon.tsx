import React from "react";
//import html2canvas from "html2canvas";

const AppIcon = () => {
    /* setTimeout(() => {
        const el = document.querySelector("#app-icon-box") as HTMLElement;
        html2canvas(el).then(canvas => {
            el.insertAdjacentElement("afterend", canvas);
        });
    }, 500); */
    return (
        <div className='dx-box' id="app-icon-box">
            <img src={process.env.PUBLIC_URL + "/assets/sprites/exit-nolabel.png"}/>
        </div>
    );
};
export default AppIcon;