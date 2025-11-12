// Скрипт для загрузки фотографий поэтов из Wikipedia
// Запустить: node scripts/download-poets-photos.js

const fs = require('fs');
const https = require('https');
const path = require('path');

// Прямые ссылки на фотографии из Wikimedia Commons
const poetsPhotos = {
    'pushkin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Kiprensky_Pushkin.jpg/800px-Kiprensky_Pushkin.jpg',
    'lermontov': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lermontov_by_Budkin_%281841%2C_location_unknown%29.jpg/800px-Lermontov_by_Budkin_%281841%2C_location_unknown%29.jpg',
    'esenin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Sergey_Yesenin_%281925%29.jpg/800px-Sergey_Yesenin_%281925%29.jpg',
    'mayakovsky': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mayakovsky_1929_a.jpg/800px-Mayakovsky_1929_a.jpg',
    'akhmatova': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Anna_Akhmatova_1922.jpg/800px-Anna_Akhmatova_1922.jpg',
    'tsvetaeva': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Marina_Tsvetaeva_1925.jpg/800px-Marina_Tsvetaeva_1925.jpg',
    'fet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Afanasy_Fet.jpg/800px-Afanasy_Fet.jpg',
    'tyutchev': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Tyutchev_by_Bergamasco.jpg/800px-Tyutchev_by_Bergamasco.jpg',
    'blok': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Alexander_Blok_circa_1906.jpg/800px-Alexander_Blok_circa_1906.jpg',
    'pasternak': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Boris_Pasternak_1958.jpg/800px-Boris_Pasternak_1958.jpg',
    'mandelstam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Osip_Mandelstam_Russian_poet.jpg/800px-Osip_Mandelstam_Russian_poet.jpg',
    'bryusov': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Valery_Yakovlevich_Bryusov.jpg/800px-Valery_Yakovlevich_Bryusov.jpg',
    'nekrasov': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Nekrasov_by_Kramskoi_1877.jpg/800px-Nekrasov_by_Kramskoi_1877.jpg',
    'gumilev': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Nikolai_Gumilyov.jpg/800px-Nikolai_Gumilyov.jpg',
    'tvardovsky': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Alexander_Tvardovsky_1958.jpg/800px-Alexander_Tvardovsky_1958.jpg',
    'simonov': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Simonov_Konstantin_1941.jpg/800px-Simonov_Konstantin_1941.jpg'
};

// Эта функция больше не нужна - используем прямые ссылки

// Функция для загрузки изображения
async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

// Основная функция
async function downloadAllPoetsPhotos() {
    console.log('🎨 Начинаем загрузку фотографий поэтов...\n');
    
    const outputDir = path.join(__dirname, '..', 'img', 'poets');
    
    // Создаём папку, если её нет
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log('📁 Создана папка:', outputDir);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [poetId, imageUrl] of Object.entries(poetsPhotos)) {
        try {
            console.log(`📥 Загружаем фото: ${poetId}`);
            console.log(`   URL: ${imageUrl}`);
            
            // Определяем расширение файла
            const ext = '.jpg';
            const filepath = path.join(outputDir, `${poetId}${ext}`);
            
            // Загружаем изображение
            await downloadImage(imageUrl, filepath);
            console.log(`   ✅ Сохранено: ${filepath}\n`);
            
            successCount++;
            
            // Небольшая пауза между запросами
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`   ❌ Ошибка для ${poetId}:`, error.message, '\n');
            errorCount++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Успешно загружено: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log('='.repeat(50));
}

// Запуск
downloadAllPoetsPhotos().catch(console.error);
