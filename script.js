const app = {
    state: {
        occasion: '',
        bodyType: '',
        skinTone: '',
        stylePref: '',
        heightRange: '',
        gender: '',
        faceShape: '',
        topImages: [],
        bottomImages: [],
        dressImages: [],
        shoeImages: []
    },

    init: function () {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM: function () {
        this.pages = document.querySelectorAll('.page');
        this.loadingOverlay = document.getElementById('loading-overlay');

        // Results elements
        this.resultTopImg = document.getElementById('result-top-img');
        this.resultBottomImg = document.getElementById('result-bottom-img');
        this.adviceText = document.getElementById('ai-advice-text');

        // Accessories
        this.makeupTip = document.getElementById('makeup-tip');
        this.jewelleryTip = document.getElementById('jewellery-tip');
        this.footwearTip = document.getElementById('footwear-tip');
        this.hairstyleTip = document.getElementById('hairstyle-tip');
    },

    bindEvents: function () {
        // File Upload Previews
        this.setupImageUpload('top-file', 'top-preview', 'topImages');
        this.setupImageUpload('bottom-file', 'bottom-preview', 'bottomImages');
        this.setupImageUpload('dress-file', 'dress-preview', 'dressImages');
        this.setupImageUpload('shoe-file', 'shoe-preview', 'shoeImages');
    },

    navigateTo: function (pageId) {
        // Hide all pages
        this.pages.forEach(page => {
            page.classList.remove('active');
            page.classList.add('hidden');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');

            // Retrigger animation
            const animatedChild = targetPage.querySelector('.animate-up');
            if (animatedChild) {
                animatedChild.style.animation = 'none';
                targetPage.offsetHeight; /* trigger reflow */
                animatedChild.style.animation = null;
            }
        }
        window.scrollTo(0, 0);
    },

    saveDetailsAndContinue: function () {
        const occasion = document.getElementById('occasion').value;
        const bodyType = document.getElementById('body-type').value;
        const skinTone = document.getElementById('skin-tone').value;

        // New fields
        const stylePref = document.getElementById('style-pref').value;
        const heightRange = document.getElementById('height-range').value;
        const gender = document.getElementById('user-gender').value;
        const faceShape = document.getElementById('user-face').value;

        if (!occasion || !bodyType || !skinTone || !stylePref) {
            alert('Please select all required options to proceed.');
            return;
        }

        this.state.occasion = occasion;
        this.state.bodyType = bodyType;
        this.state.skinTone = skinTone;
        this.state.stylePref = stylePref;
        this.state.heightRange = heightRange;
        this.state.gender = gender;
        this.state.faceShape = faceShape;

        this.navigateTo('upload-page');
    },

    setupImageUpload: function (inputId, previewId, stateKey) {
        const input = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewId);

        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                // Clear existing for this batch (optional: could append instead)
                this.state[stateKey] = [];
                previewContainer.innerHTML = '';
                previewContainer.classList.add('has-images');

                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imgUrl = event.target.result;
                        this.state[stateKey].push(imgUrl); // Store in array

                        // Add to preview grid
                        const img = document.createElement('img');
                        img.src = imgUrl;
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    },

    generateOutfit: function () {
        // Check if at least one outfit type is possible (Top+Bottom OR Dress)
        const hasSeparates = (this.state.topImages.length > 0 && this.state.bottomImages.length > 0);
        const hasDress = (this.state.dressImages.length > 0);

        if (!hasSeparates && !hasDress) {
            alert('Please upload either (Tops + Bottoms) OR (Dresses) to generate an outfit.');
            return;
        }

        // Show loading
        this.loadingOverlay.classList.remove('hidden');

        // Simulate AI Processing time
        setTimeout(() => {
            this.loadingOverlay.classList.add('hidden');
            this.showResults();
            this.navigateTo('result-page');
        }, 2500);
    },

    showResults: function () {
        const hasSeparates = (this.state.topImages.length > 0 && this.state.bottomImages.length > 0);
        const hasDress = (this.state.dressImages.length > 0);

        // Decide what to show: Prefer Separates if Western, Dress if Traditional (logic example)
        let showDress = false;
        if (hasDress && (!hasSeparates || this.state.stylePref === 'traditional')) {
            showDress = true;
        } else if (!hasSeparates && hasDress) {
            showDress = true;
        }

        if (showDress) {
            const randomDress = this.state.dressImages[Math.floor(Math.random() * this.state.dressImages.length)];
            this.resultTopImg.src = randomDress; // Reusing top img slot for dress
            this.resultBottomImg.style.display = 'none'; // Hide bottom slot
            document.querySelector('.plus-sign').style.display = 'none';
            this.resultTopImg.parentElement.querySelector('.label').textContent = "Selected Dress";
        } else {
            // Show Separates
            const randomTop = this.state.topImages[Math.floor(Math.random() * this.state.topImages.length)];
            const randomBottom = this.state.bottomImages[Math.floor(Math.random() * this.state.bottomImages.length)];

            this.resultTopImg.src = randomTop;
            this.resultBottomImg.src = randomBottom;
            this.resultBottomImg.style.display = 'block';
            document.querySelector('.plus-sign').style.display = 'block';
            this.resultTopImg.parentElement.querySelector('.label').textContent = "Selected Top";
        }

        // 2. Generate Advice based on Occasion & Skin Tone (Mock AI)
        const advice = this.getMockAdvice();
        this.adviceText.textContent = advice.text;

        this.makeupTip.textContent = advice.makeup;
        this.jewelleryTip.textContent = advice.jewellery;
        this.footwearTip.textContent = advice.footwear;
        this.hairstyleTip.textContent = advice.hairstyle;
    },

    getMockAdvice: function () {
        const rules = {
            party: {
                text: "This combination is bold and perfect for a night out! The contrast creates a dynamic look that stands out under evening lights.",
                makeup: "Smokey eyes & nude lip",
                jewellery: "Statement chandelier earrings",
                footwear: "High block heels or stilettos",
                hairstyle: "Sleek high ponytail"
            },
            wedding: {
                text: "Elegant and sophisticated. This pairing respects tradition while offering a modern silhouette suitable for wedding festivities.",
                makeup: "Dewy base with rosy cheeks",
                jewellery: "Kundan or Gold set",
                footwear: "Embellished juttis or heels",
                hairstyle: "Soft bun with fresh flowers"
            },
            casual: {
                text: "Effortlessly chic. Great for brunch or a day out with friends. It balances comfort with style perfectly.",
                makeup: "No-makeup makeup look",
                jewellery: "Minimal hoop earrings",
                footwear: "White chunky sneakers",
                hairstyle: "Messy bun or loose waves"
            },
            formal: {
                text: "Sharp and professional. This look commands respect and fits perfectly in a corporate or formal setting.",
                makeup: "Matte finish & neutral tones",
                jewellery: "Small studs & simple watch",
                footwear: "Classic pumps or loafers",
                hairstyle: "Neat low bun or straight hair"
            },
            traditional: {
                text: "A beautiful ethnic ensemble. The colors complement your skin tone and fit the festive vibe wonderfully.",
                makeup: "Bold red lip & kohl eyes",
                jewellery: "Traditional heavy jhumkas",
                footwear: "Golden Kolhapuri chappals",
                hairstyle: "Braid with accessories"
            },
            college: {
                text: "Cool and comfy. Perfect for long days on campus where you want to look good without trying too hard.",
                makeup: "Tinted lip balm & mascara",
                jewellery: "Layered thin chains",
                footwear: "Canvas shoes or slip-ons",
                hairstyle: "High messy bun"
            }
        };

        // Default fallback
        const defaultAdvice = {
            text: "This outfit looks great on you! The colors are harmonized and fit your body type well.",
            makeup: "Natural glow",
            jewellery: "Simple gold chain",
            footwear: "Comfortable flats",
            hairstyle: "Open hair with soft texture"
        };

        return rules[this.state.occasion] || defaultAdvice;
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
