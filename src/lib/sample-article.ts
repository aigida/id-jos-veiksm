/** A clearly fictional sample text used only to try the article analysis. */
export const SAMPLE_ARTICLE = {
  title: "Savivaldybė ryžosi skausmingam žingsniui: dvi kaimo mokyklos bus uždarytos",
  portal: "Pavyzdinis portalas",
  date: "2026-11-10",
  text: `Pavyzdinio rajono savivaldybės taryba antradienį balsų dauguma nusprendė nuo kitų mokslo metų uždaryti dvi kaimo mokyklas. Už sprendimą balsavo 17 tarybos narių, prieš – 8.

Meras Jonas Pavyzdys teigė, kad sprendimas buvo neišvengiamas. „Per penkerius metus mokinių skaičius šiose mokyklose sumažėjo beveik perpus, o vieno mokinio išlaikymas kainuoja dvigubai daugiau nei rajono vidurkis“, – sakė meras.

Pasak savivaldybės administracijos, mokiniai bus vežami į rajono centro gimnaziją, kuri esą turi geresnę laboratorijų ir sporto bazę. Administracija skaičiuoja, kad per metus bus sutaupyta apie 400 tūkst. eurų.

Opozicijos atstovė tarybos narė Rūta Bandomoji sprendimą pavadino „skubotu ir neapgalvotu“. „Su bendruomenėmis niekas rimtai nesikalbėjo. Tai smūgis kaimui, iš kurio jis gali ir neatsigauti“, – teigė ji.

Švietimo politikos ekspertė dr. Laima Tyrėja atkreipė dėmesį, kad tyrimai rodo nevienareikšmius rezultatus: mažose mokyklose mokiniai dažnai sulaukia daugiau individualaus dėmesio, tačiau didesnėse mokyklose būna platesnis dalykų pasirinkimas.

Sprendimas dar turės būti suderintas su Švietimo, mokslo ir sporto ministerija. Tarybos posėdyje dalyvavę keli tėvai žadėjo kreiptis į teismą.`,
};

/** Two fictional reports of the same fictional event, used to try the comparison. */
export const SAMPLE_COMPARISON = {
  topic: "Kaimo mokyklų uždarymas Pavyzdinio rajone",
  articles: [
    {
      portal: "Pavyzdinis portalas A",
      title: SAMPLE_ARTICLE.title,
      text: SAMPLE_ARTICLE.text,
    },
    {
      portal: "Pavyzdinis portalas B",
      title: "Tėvai po tarybos sprendimo: „Mūsų vaikai taps autobusų keleiviais“",
      text: `Antradienio vakarą Pavyzdinio rajono savivaldybės salėje susirinkę tėvai ašarodami išklausė tarybos sprendimą uždaryti dvi kaimo mokyklas. Sprendimui pritarė 17 tarybos narių.

„Mūsų vaikai kasdien praleis po pusantros valandos autobuse. Niekas mūsų neklausė“, – po posėdžio sakė trijų vaikų mama Asta Kaimietė. Jos teigimu, bendruomenė surinko daugiau nei 600 parašų už mokyklos išsaugojimą, tačiau peticija posėdyje nebuvo aptarta.

Mokyklos direktorė Irena Mokytoja priminė, kad mokykla yra ne tik ugdymo įstaiga, bet ir vienintelė kaimo bendruomenės susibūrimo vieta. „Uždarius mokyklą, išnyks ir biblioteka, ir būreliai“, – teigė ji.

Savivaldybė sprendimą grindžia mažėjančiu mokinių skaičiumi ir išlaidomis. Administracijos skaičiavimais, per metus būtų sutaupyta apie 400 tūkst. eurų.

Tėvai teigia ketinantys kreiptis į teismą ir prašyti ministerijos įvertinti, ar buvo tinkamai atsižvelgta į bendruomenės nuomonę.`,
    },
  ],
};
