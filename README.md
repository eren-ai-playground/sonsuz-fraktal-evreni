# Sonsuz Fraktal Evreni

Tamamen Türkçe bir yerel matematik laboratuvarı. Mandelbrot ve doldurulmuş Julia görüntüleri hazır resimlerden değil, her örneğin gerçek `zₙ₊₁ = zₙ² + c` hesabından üretilir. React + TypeScript + Vite arayüzü, Web Worker hesabı ve Canvas 2D çizimi kullanır. Hesap açma, API anahtarı ve backend gerekmez.

## Kurulum ve çalıştırma

Node.js **22.12 veya üzeri** gerekir. Proje klasöründe:

```sh
npm install
npm run dev
```

Adres: **http://127.0.0.1:5191**. İnternet paketlerin ilk kurulumunda gerekir; çalışan uygulama harici servis kullanmaz.

```sh
npm test                 # matematik ve UI testleri
npm run build            # TypeScript kontrolü ve üretim paketi
npm run preview          # üretim paketini Vite ile aç
npm start                # dist klasörünü yalnızca Node.js ile sun
npm run test:browser     # çalışan yerel sunucuda gerçek tarayıcı kontrolleri
```

Alternatif, kilitli kurulum: `pnpm install --frozen-lockfile`, ardından `pnpm test`, `pnpm run build`, `pnpm run dev`. Depo `pnpm-lock.yaml` ve esbuild yapılandırmasını içerir. Npm ilk kurulumda kendi kilit dosyasını oluşturur.

ZIP içindeki `dist` klasörü hazır derlemedir. Windows'ta `BASLAT.cmd` dosyasına çift tıklayın; sunucu başlar ve **http://127.0.0.1:5191** varsayılan tarayıcıda açılır. Node.js gerekir. Paket kurmadan `node scripts/serve.mjs` ile de açılabilir. `index.html` dosyasına çift tıklamak modül/worker güvenlik kısıtları nedeniyle desteklenmez; yerel HTTP sunucusunu kullanın. PORT ortam değişkeni `npm start` portunu değiştirebilir.

Tarayıcı test betiği Windows'ta kurulu Chrome'u bulur. Başka bir ortamda `npx playwright install chromium` veya `BROWSER_PATH` ortam değişkeniyle bir Chromium yolu kullanın. `TEST_URL` başka bir yerel sunucu adresini seçebilir. Her test kendi tarayıcı bağlamında çalışır.

## Kullanım

- Özelliklerin yanındaki **?** düğmesi kısa bir açıklama açar. Dışarı tıklamak, Escape veya sayfayı kaydırmak açıklamayı kapatır.
- Tekerlek imleçte yakınlaştırır; sürükleme kamerayı kaydırır. Dokunmatik iki parmak pinch desteklenir. Tuval `touch-action: none` kullanır; çevresindeki sayfa kaydırılabilir.
- Tuvale Tab ile odaklanın: `+` / `−` zoom, oklar kaydırma, `H` ana görünüm, `B` bir önceki kamera. Her kümenin kamera geçmişi bağımsızdır; en son 50 görünüm tutulur.
- Mandelbrot'ta bir tık c seçer. “Julia noktası seç” açıkken sürükleyerek c seçilir. Bölünmüş ekran iki kümenin bağımsız kameralarını birlikte gösterir.
- Soldaki ayarlar iterasyon, kaçış eşiği, palet, renk döngüsü, parlaklık, çözünürlük ve örneklemeyi değiştirir. Julia parametresi elle veya hazır örneklerle girilebilir.
- Durdur etkin işleri geçersiz kılar; Devam et ve Yeniden çiz mevcut parametrelerle yeni hesap başlatır. Bu düğmeler bir sonraki satır parçasında işçiye ulaşır; UI hemen güncellenir.
- Yörünge paneli z₀'dan başlayarak N adım ve iki başlangıç arasındaki farkı çizim, tablo ve CSV olarak sunar. İlk değer dahil toplam en fazla N+1 kayıt olur. |z| > 10⁶ veya taşmada daha erken durur.
- Ölçüm paneli sabit kamerada 180×120 / 360×240 ve 100 / 400 / 1200 iterasyonla altı gerçek koşulu sırasıyla çalıştırır. Bir örnek/piksel kullanır; seçili palet, eşik ve optimizasyon korunur. Grafikteki süreler işçinin hesabını ve parça zamanlayıcısını içerir, ana ekranın çizim aktarımını içermez.
- PNG tamamlanmış aktif tuvali, bölünmüş görünümde iki tuvali yan yana kaydeder. Ayarlar altında JSON dışa/içe aktarımı bulunur. JSON doğrulanır; hatalı dosya mevcut oturumu bozmaz.
- Görünümü paylaş iki kamerayı, c ve kalıcı hesap ayarlarını URL hash'ine kaydeder. Sayfa yeniden yüklenince görünüm geri gelir. Panoya erişim yoksa adres çubuğundaki URL kopyalanabilir. URL herhangi bir sunucuya parametre göndermez.

## Mimari

```text
src/core/complex.ts          kompleks aritmetik ve yörünge
src/core/fractal.ts          kaçış, güvenli yarıçap ve analitik iç test
src/core/camera.ts           koordinat dönüşümü, pan, zoom ve hassasiyet
src/core/palettes.ts         deterministik renkler
src/core/session.ts          JSON doğrulama, URL ve dosyalar
src/engine/render.ts        saf satır hesabı ve render kimlik kapısı
src/engine/fractal.worker.ts asenkron parça hesabı ve iptal
src/components/FractalView.tsx  kamera girdileri ve kademeli çizim
src/components/OrbitPanel.tsx   yörünge çizimi, tablo ve CSV
src/components/BenchmarkPanel.tsx  sabit koşullu ölçümler
src/components/Help.tsx      soru işareti düğmesi ve açılır açıklama
src/data/help.ts             özellik açıklama metinleri
src/data/experiments.ts      sekiz deney ve uygulanabilir başlangıçlar
src/App.tsx                 oturum, ayarlar, sayfalar ve dışa aktarım
tests/                      çekirdek, UI ve ölçüm regresyon testleri
scripts/browser-test.mjs    gerçek tarayıcı entegrasyon kontrolleri
scripts/serve.mjs            hazır derlemeyi yerel HTTP ile sunma
```

## Algoritma ve bilimsel sınırlar

Mandelbrot için z₀ = 0, c = piksel; Julia için z₀ = piksel, c = seçili parametre. Kaçış kontrolü `|z| > R` kullanır. Sınırı aşmayan noktalar siyah çizilir; sonlu iterasyon kararı kesin üyelik iddiası taşımaz. Görüntülenen Julia içi **doldurulmuş Julia** kümesinin yaklaşımıdır; matematiksel Julia onun sınırıdır.

Mandelbrot'ta R en az 2'dir. Keyfi Julia c değerleri için `R² − R ≥ |c|` yeterli koşulunu sağlayan `(1 + √(1 + 4|c|))/2` alt sınırı otomatik uygulanır. Büyük yarıçaplar kaçış adımını ve sonlu sınırda kaçmamış piksel sayısını değiştirebilir. c=0 disk içi/dışı test edilir; sınır pikselleri üyelik kanıtı diye test edilmez.

Yumuşak renk `μ = n + 1 − log₂(log|zₙ|)` kullanır; klasik renk n tam sayısını kullanır. Renkler kaçış zamanının görsel eşlemesidir. Parlaklık ve döngü matematiksel tanımı değiştirmez. Mandelbrot ana kardioidi ve period-2 diskinin sıkı iç testleri yuvarlama için 10⁻¹⁴ payla uygulanır; kapatılabilir. Optimizasyonun açık/kapalı sonuçları örnek ızgarada karşılaştırılır.

Piksel aralığı yatay span / çizim genişliğidir. Dönüşüm dikey span = yatay span × yükseklik / genişlik kullanır; kompleks x/y birimleri eşittir. Zoom seçilen imleç noktasını sabit tutar. Ana görünüm yatay kapsamı korur; dar telefonlarda daha fazla dikey alan görünür.

## Performans ve makul varsayımlar


Her görünüm bir işçi kullanır. Önizleme boyutları nihai boyutun %28'idir, örneklemesi 1'dir. 70 ms hareketsizlik sonrası önizleme; bitince 120 ms bekleme sonrası tam geçiş yapılır. Gezinirken önceki gerçek görüntü korunur. Yeni kamera/ayar işi iptal eder ve 1–8 satırlık parçalardan sonra işçi yeni işi kabul eder; eski kimlikli sonuçlar tuvale yazılamaz. Uzun senkron satır parçası sırasında işçi iptali gecikebilir; arayüz hesabı ana iş parçacığında değildir.

Her görünüm en fazla 1600×1200, ayrıca en fazla 1,8 milyon piksele ölçeklenir. Aynı anda iki aktif görünüm, ölçüm açıkken bir ek işçi vardır. Yüzlerce iş kuyruğa eklenmez; önceki işin döngüsü sonlandırılır. İterasyon 50–3000, çözünürlük 0,5 / 0,75 / 1 / 1,5×, örnekleme 1 veya 4'tür. Son 12 tamamlanmış render özeti tutulur; bu kayıtlar farklı koşullarda olabilir.

Renk hareketi kapalı başlar. Açılırsa 2,4 saniyede bir tam renk/hesap güncellemesi yapılır; pahalı ayarlarda kapalı tutulması uygundur. Durdurulunca hareket de durur. FPS raporlanmaz, çünkü statik fraktal işçilerinin hesap süresi ekran yenileme FPS'sine eşit değildir. Süre metrikleri `performance.now()` ile işçide ölçülür; ana ekrandaki değer son tamamlanan ayrıntı geçişidir.

## Hassasiyet ve eksikler

IEEE 754 JavaScript Number çift hassasiyetlidir. Piksel aralığı `64 × Number.EPSILON × max(1, |merkez Re|, |merkez Im|)` altındaysa uyarı gösterilir. Zoom minimumu CSS pikseline göre 16 ε'dir; yüksek çözünürlük seçimi gerçek örnek aralığını biraz daha küçültebilir. Bu kaba koruma genel yuvarlama hata garantisi değildir. Keyfi hassasiyet/decimal veya perturbasyon modu uygulanmadı; sınırsız doğru yakınlaştırma iddiası yoktur.

Canlı önizleme için girişler 70 ms süzülür; çok hızlı sürekli hareket boyunca önceki görüntü kalabilir. Julia parametresini değiştirmek Mandelbrot hesabını yenilemez; yalnızca işaretçi güncellenir. PNG ekranın UI metinlerini içermez; fraktal pikselleri içerir. Seçili deney ve geçici durdurma/animasyon durumu URL/JSON oturumuna dahil edilmez. İşçiler güncel modül-worker destekli tarayıcı gerektirir.

Önerilen geliştirmeler: perturbasyon tabanlı derin zoom ve doğrulanmış hata sınırları, iterasyon tamponu ile yalnızca renk değiştiren ucuz animasyon, adaptif kaçış örneklemesi, daha fazla cihazda uzun süreli performans ölçümü.

## Doğrulama sonuçları

30 Ekim 2026 düzeltmelerinden sonra aynı bilgisayarda: `vitest run` **3 dosyada 56 test geçti**, TypeScript kontrolü ve üretim derlemesi başarılı, üretim `dist` üzerinde `scripts/browser-test.mjs` **22 kontrol geçti, JavaScript/HTTP hatası 0**.


- `pnpm run build`: **TypeScript kontrolü ve Vite üretim derlemesi başarılı**.
- Üretim `dist` klasörünü sunan yerel HTTP sunucusunda `TEST_URL=http://127.0.0.1:5192` ile `node scripts/browser-test.mjs`: **20 kontrol geçti, JavaScript/HTTP hatası 0**. Sonradan genişletilen sonlu kamera doğrulaması ayrıca URL birim testiyle doğrulandı; render kaynakları bu değişiklikten etkilenmez.
- Masaüstü 1440 piksel; telefon 360/390 ve tablet 768 pikselde yatay taşma kontrolü, ayrıca masaüstü ve telefon PNG'lerinin görsel incelemesi yapıldı.

Matematik testleri c=0, −1, 2; Julia c=0 iç/dış; kompleks işlemler; kamera tersi, en-boy oranı ve zoom odak sabitliği; palet determinizmi; JSON/URL hataları; tile render; iptal kimliği ve UI davranışlarını kapsar. Ölçüm paneli regresyon testi, React toplu güncellemesinde altı koşulun doğru satırlara atanmasını denetler. Tarayıcı testleri gerçek worker, gerçek canvas, dosya içeriği, kamera girdileri ve iki parmak etkileşimini kontrol eder. `test-results` tanılama ve QA dosyalarını içerir, kaynak dağıtımına gerekmez.


## Öğrenme kaynağı

[Cornell Math Explorers' Club — The Mandelbrot Set](https://pi.math.cornell.edu/~lipa/mec/lesson5.html): kompleks iterasyon, doldurulmuş Julia, kritik yörünge ve bağlılık ilişkisi için birincil üniversite kaynağı. Uygulamada sonlu hesapla matematiksel tanım arasındaki ayrım korunur.
