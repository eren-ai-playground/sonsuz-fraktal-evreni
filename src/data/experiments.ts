import type { Session } from '../core/types';
import { defaultSession } from '../core/session';
export const experiments=[
  {title:'Bir kıyının içine yolculuk',tag:'MANDELBROT',purpose:'Kümenin genel biçimi ile sınırındaki küçük yapıları keşfet.',parameter:'Kamera merkezi ve yakınlaştırma.',observe:'Siyah bölgenin kenarına yaklaş. Benzer biçimler hangi ölçeklerde ortaya çıkıyor?',science:'Mandelbrot kümesi z₀ = 0 yörüngesi sınırlı kalan c değerlerinden oluşur. Sonlu hesap, her siyah pikselin üyeliğini kanıtlamaz.'},
  {title:'Bir nokta, başka bir evren',tag:'JULIA',purpose:'Mandelbrot parametresi ile Julia görünümü arasındaki ilişkiyi keşfet.',parameter:'Mandelbrot üzerindeki c noktası.',observe:'Sol görünümde bir noktaya tıkla veya Julia seç aracını kullan. Sağdaki biçim değişimini izle.',science:'Mandelbrot parametre düzlemidir. Julia görünümünde c sabittir; piksel z₀ değerini verir.'},
  {title:'Ayrıntının bedeli',tag:'İTERASYON',purpose:'İterasyon sınırının görünür ayrıntıyı nasıl değiştirdiğini karşılaştır.',parameter:'İterasyon üst sınırı 100 → 400 → 1200.',observe:'Aynı kıyıda daha önce siyah olan piksellerin kaçışını ve render süresini izle.',science:'Geç kaçan noktalar düşük iterasyon sınırında kaçmamış görünür. Sınırı artırmak hassasiyet kaybını düzeltmez.'},
  {title:'Renk ile küme arasındaki fark',tag:'KAÇIŞ',purpose:'Kaçış yarıçapı ve renklendirmeyi birbirinden ayır.',parameter:'Kaçış yarıçapı 2 → 8; klasik bantlar ve yumuşak palet.',observe:'Renkler ve sonlu iterasyon kararı nasıl değişiyor? İç biçim neden çoğunlukla korunuyor?',science:'Geçerli bir kaçış eşiğini aşmak dışarıda olmayı gösterir. Büyük yarıçapta aynı sonlu sınır farklı sonuç verebilir. Renkler matematiksel kümenin tanımı değildir.'},
  {title:'Birbirine çok yakın iki başlangıç',tag:'YÖRÜNGE',purpose:'İki yakın z₀ değerinin yörüngelerini karşılaştır.',parameter:'Yörünge başlangıcı ve küçük δ farkı.',observe:'Turkuaz ve mor izler hangi adımda ayrılıyor? Fark tablosunu incele.',science:'Duyarlılık başlangıca ve parametreye bağlıdır. Her yörünge kaotik değildir; sonlu adımlar genel bir kaos kanıtı sağlamaz.'},
  {title:'Kritik noktanın hikâyesi',tag:'KRİTİK YÖRÜNGE',purpose:'z₀ = 0 kritik yörüngesini incele.',parameter:'c = 0, −1 veya 0.3 + 0.5i; adım sayısı.',observe:'c = 0 için sabit nokta, c = −1 için 0 ↔ −1 döngüsünü gözle.',science:'z² + c türevi 2z olduğu için z = 0 kritiktir. Kritik yörünge Mandelbrot–Julia ilişkisini belirler.'},
  {title:'Bir ada mı, bir toz bulutu mu',tag:'BAĞLILIK',purpose:'Bağlı ve ayrık doldurulmuş Julia örneklerini karşılaştır.',parameter:'c = 0 ve c = 0.4 + 0.4i.',observe:'Hazır örnekleri değiştir; kritik yörünge kaçış durumuna bak.',science:'Bu kuadratik ailede kritik yörünge sınırlıysa Julia kümesi bağlıdır; kaçarsa tamamen ayrıktır. Sınırlı bir render topolojik kanıt değildir.'},
  {title:'Kaliteyi ölç',tag:'PERFORMANS',purpose:'Aynı kamerada kalite ve gerçek hesap süresini karşılaştır.',parameter:'İterasyon ve çözünürlük; altı ölçüm.',observe:'Ölçüm sekmesinde karşılaştırmayı başlat. Sütunlar ölçülen milisaniyeyi gösterir.',science:'Piksel sayısı yaklaşık çözünürlük çarpanının karesiyle büyür. CPU, yörünge davranışı ve zamanlayıcı nedeniyle süre doğrusal olmak zorunda değildir.'}
];
export function experimentSession(index:number): Session {
  const s=defaultSession();
  if(index===1)s.mode='split';
  if(index===2){s.camera={re:-.7435,im:.1314,span:.025};s.settings.iterations=100;}
  if(index===3){s.settings.palette='classic';s.settings.radius=2;}
  if(index===4){s.mode='julia';s.c={re:-.8,im:.156};}
  if(index===5){s.mode='split';s.c={re:-1,im:0};}
  if(index===6){s.mode='julia';s.c={re:0,im:0};}
  return s;
}
