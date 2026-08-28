fetch("diary.html")
    .then(response => response.text())
    .then(html => {

        const parser = new DOMParser();
        const diaryPage = parser.parseFromString(html, "text/html");

        const entries = diaryPage.querySelectorAll(".diary-entry");
        const latestDiaryArea = document.querySelector("#latest-diary");

        if (entries.length > 0 && latestDiaryArea) {

            const latestDiary = entries[0];

            const date = latestDiary.querySelector("h2");
            const text = latestDiary.querySelector("p");

            let preview = "";

            if (text) {
                preview = text.textContent.substring(0, 80);

                if (text.textContent.length > 80) {
                    preview += "...";
                }
            }

            latestDiaryArea.innerHTML = `
                <p>${date.textContent}</p>
                <p>${preview}</p>
            `;

        } else if (latestDiaryArea) {

            latestDiaryArea.innerHTML = "日記がありません。";

        }

    })
    .catch(error => {

        const latestDiaryArea = document.querySelector("#latest-diary");

        if (latestDiaryArea) {
            latestDiaryArea.innerHTML = "日記を読み込めませんでした。";
        }

    });