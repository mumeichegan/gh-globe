<script setup>
import { onMounted, ref } from 'vue';
import imageGalaxy from './assets/galaxy.webp'

import imageCat from './assets/astrocat.png'

import { defineAsyncComponent } from 'vue'

import Attribution from './components/Attribution.vue'

const Globe = defineAsyncComponent(() =>
  import('./components/Globe.vue')
)

const loadedImageGalaxy = ref(null)

onMounted(function() {
    const image = new Image()
    image.onload = function() {
        loadedImageGalaxy.value = this.src
    }
    image.src = imageGalaxy
})
</script>

<template>
    <div class="bg">
        <div class="bg-overlay" :style="{ backgroundImage: loadedImageGalaxy && `url(${loadedImageGalaxy})` }"></div>
    </div>
    
    <client-only>
        <Globe />
    </client-only>

    <header>
        <nav class="nav">
            <div>
                <ul class="nav-links">
                    <li><a href="#">euismod</a></li>
                    <li><a href="#">commodo</a></li>
                    <li><a href="#">pharetra</a></li>
                </ul>
                <ul class="nav-btns">
                    <li><a href="#">Vivamus eu purus mollis</a></li>
                    <li><a href="#">Morbi nec est sed</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <article class="intro">
        <h1>Phasellus auctor nulla eget leo vestibulum tincidunt</h1>
        <p>Mauris vestibulum dui ac ligula sodales, vulputate pharetra sapien ultricies. Pellentesque dapibus, ligula eu efficitur egestas, purus ante iaculis ante, vel fermentum nulla tellus id erat. Vivamus eu purus mollis</p>
        <ul class="intro-btns">
            <li><a href="#">Quisque convallis nibh eget</a></li>
            <li><a href="#">Aliquam porta porttitor</a></li>
        </ul>
    </article>

    <footer>
        <div class="astrocat-s">
            <div class="astrocat-w" :style="{ backgroundImage: loadedImageGalaxy && 'unset' }">
                <img @dragstart.prevent :src="imageCat" alt="" width="305" height="307">
            </div>
        </div>
    </footer>

    <Attribution></Attribution>

    

</template>

<style>
.data-info {
    position: absolute;
    max-width: 450px;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    display: none;
    font-family: monospace;
    padding: 16px 32px 16px 8px;
    top: 0;
    left: 0;
    border-radius: 6px;
    word-wrap: break-word;
    color: #fff;
}

.card {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}
.card > div:first-of-type {
    padding-right: 8px;
    padding-top: 4px;
    padding-left: 8px;
}
.card-header {
    font-size: 16px;
    line-height: 1.5;
    color: #ddd;
}
.card-body {
    font-size: 12px;
}

.bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-image: url(data:image/webp;base64,UklGRpgBAABXRUJQVlA4IIwBAACQDACdASqgAFEAPlEokEYjoqGhIjgJkHAKCWkDvZ32gG/Nj+X6GNJ4cz2U9hMBgfXpiFa595VH3r9M/IgCA5okxrZkl/hoqnhOW/0+beQXd45Z1OkayVj2/i7XX70pzxl3AkoWIEHjVi4dWogAAP778n0ZLhMbUsXgWaXIOsw0H0ehczTK14vw9bJstfJyUWDw+fT5gfm8P4ZJ/1qjTSk+roz5z+HTRECprP06TqPfb+FeqiOI9p9jUUz6xOrjSIF/oiinUSHCJhTcY6aNDzolvfcvtaBgw4eB+Vxs+tZEhGH9yf9H9XN5IVMro3FYTJGf8ahdNhkMUlCQDhehvsGnrK3I0P2nJ35he1Hdzfkt6jTRL0VwYcvAS6v8NamTZ5Ti1DQahEUWu1XarR3n+v5AZSkxikPcI5ceFjCX+H2QNCAcOFAFblBdRy9XsRolW5tG9tZqN26djbu6g0hGvMNIk7lxBLRRGx+KTnwd6L4VHnS1GEke0IaBQ/KYHBnDu/SElFpKHegAAAAAAAA=);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
.bg-overlay {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

header {
    position: relative;
    background: #0d1117;
    box-shadow: 0 3px 6px #010409 ,0 1px 1px rgba(0,0,0,.1);
}

nav > div {
    display: flex;
    justify-content: space-between;
    max-width: 1280px;
    padding: 16px;
    margin: 0 auto;
}

.nav-links, .nav-btns {
    display: flex;
    padding: 8px 0;
}

.nav-links li:not(:first-of-type) {
    margin-left: 24px;
}

.nav-btns li:not(:first-of-type) {
    margin-left: 16px;
}

.nav-links a {
    color: #fff;
}

.nav-btns a {
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    border-radius: 0.375rem;
    box-shadow: rgba(255, 255, 255, 0.25) 0 0 0 1px inset;
    color: #fff;
}

.nav-btns li:last-of-type a {
    color: #0d1117;
    background: #fff;
}


footer {
    width: 305px;
    position: absolute;
    bottom: 1.5%;
    left: 50%;
    transform: translateX(-50%);
}


.astrocat-s {
    width: 100%;
    height: 0;
    padding-bottom: calc(807 / 801 * 100%);
    position: relative;
}

.astrocat-w {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(data:image/webp;base64,UklGRgoDAABXRUJQVlA4WAoAAAAQAAAAKQAAKQAAQUxQSG8CAAABoETbtmnbGWvv875t27Zt27Zi205Ktm3btm3bTi7OnoWLd05UjogJ4H+9ee+d/Q0sorjzaTmg/fh50wc3AnOpeFh7893nH3PSBbdcOgd8Cp42D7y9W+P6C8aMmLHHM7e2xifmaPHpl1trHPyWlPvqiN7nv9IFn9wDP6+q+pSUC5Kuqn/KY9WwZBz9tTeX6a9YUpzVKY3u2pcomYi9X248RzkVz2vtnLsjLKHTbmA/ZUvE+mTIrd1xiXhOP53zlCuhWAdeOiaxo0+s94ricm65cXRia857SbHKuf3urgk5Ol/yYlkhf/OFJG2c/YlCqZzeumUqPiHPzcrEJYI+vWwzjoSNlidLoSDEumXjLFJ0cPR3CiqamYqz5HARdW9RrNwPn91wYnWMNCt8gxuVV+aCDYCRpsGXilW4M440jZV3ZuIgKQ6aiE/B4Cf9rqJZ7UaUAo7xHykuCOHPwbg0qOBS5Qry+qFVOo5+fylIivVuXzxpRhypjKS8LgZPqp46byguuIEKUnX0nT2tIOjHpmCAWaXMinW7Z/2fKvirJVXBHFhlCs1547CtPyhIQYcwrQ9QsxOR95ErZo6hPapEAG13uV35EEIsrT5ia5c2jY/uT1EDLAL6HnD+jMEzr/9a5Ycfbt/txj0nzTn3wesm4DCoW8fXaLL60YUzT3jkvHu+/P3Tb7795ouP3njv/UfOn9WtQZsWHSfMndERM7qdvdekQUMGHXbvLu1Z13P61NbV6tStU7MiGtqZ8X077H7rBgoNo+nwdgawSnp46/h6lO2heqPa5rw3wADMeUYfut9SwDkr6QwcZZszAAdgnspbKQBWUDggdAAAADAEAJ0BKioAKgA//f7/f7+6Nj+uNAgD8D+JbAGj/5avvJICb60sJRCEAAD+0n+rH5pqxiVJUCJ+tF+HOLcQicqOqtacThnuRcepSsDKec8aFHqHMT1NPVhS9vOb61C0O/8OBVXJ+lRV0iFQI7S8ZpV7OAAA);
    background-repeat: no-repeat;
    background-size: contain;
}

.astrocat-w img {
    display: block;
    height: auto;
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}

.intro {
    display: none;
    position: relative;
}

.intro h1 {
    margin-top: 5%;
    font-size: 3vh;
    line-height: 4vh;
    text-align: center;
}
.intro p {
    margin-top: 2.5%;
    font-size: 1.65vh;
    line-height: 2.25vh;
    color: #7d8590;
    text-align: center;   
}

.intro h1,
.intro p {
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
}

.intro-btns {
    width: 80%;
    margin: 2.75% auto;
    
}

.intro-btns li {
    border-radius: 0.375rem;
    box-shadow: rgba(255, 255, 255, 0.25) 0 0 0 1px inset;
    display: flex;
}

.intro-btns a {
    font-size: 1.85vh;
    font-weight: 700;
    padding: 1.85vh 0;
    text-align: center;
    color: #fff;
    flex-grow: 1;
}

.intro-btns li:last-of-type {
    margin-top: 3.75%;
    background-color: #fff;
    
}
.intro-btns li:last-of-type a {
    color: #0d1117;
}

@media (max-width: 825px) {
    .nav > div {
        justify-content: space-around;
    }
    .nav-btns {
        display: none;
    }
    .nav-links {
        font-size: 16px;
    }
    .intro {
        display: flex;
        flex-direction: column;
    }
    footer {
        transform-origin: bottom;
        transform: translateX(-50%) scale(.7377);
    }
    .data-info {
        max-width: 350px;
    }
    .card-header {
        font-size: 14px;
    }
    .card-body {
        font-size: 10px;
    }
}
</style>