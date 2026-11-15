export interface HindiDialoguePair {
  text: string;
  tts: string;
}

export interface AmbientActorLine extends HindiDialoguePair {
  speaker: string;
  role: 'officer' | 'inspector' | 'citizen' | 'judge' | 'lawyer' | 'clerk';
  seed: number;
}

const lastPickedIndex: Record<string, number> = {};

function pickNonRepeating<T>(key: string, pool: readonly T[]): T {
  if (pool.length <= 1) return pool[0];
  const prev = lastPickedIndex[key] ?? -1;
  let idx = Math.floor(Math.random() * pool.length);
  if (idx === prev) {
    idx = (idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length;
  }
  lastPickedIndex[key] = idx;
  return pool[idx];
}

function applyTemplate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function pickHindiLine(
  category: DialogueCategory,
  vars?: Record<string, string | number>,
): HindiDialoguePair {
  const pool = DIALOGUE_POOLS[category];
  const chosen = pickNonRepeating(category, pool);
  return {
    text: applyTemplate(chosen.text, vars),
    tts: applyTemplate(chosen.tts, vars),
  };
}

export function pickAmbientActorLine(
  category: 'court_ambient' | 'thana_ambient' | 'thana_lockup_ambient',
): AmbientActorLine {
  const pool = AMBIENT_POOLS[category];
  return pickNonRepeating(category, pool);
}

export type DialogueCategory =
  | 'judge_open'
  | 'inspector_charge'
  | 'vakil_bailable'
  | 'vakil_high_bail'
  | 'vakil_serious'
  | 'inspector_rebuttal_fatal'
  | 'inspector_rebuttal_serious'
  | 'inspector_rebuttal_normal'
  | 'judge_order_fatal'
  | 'judge_order_bail'
  | 'judge_order_high_bail'
  | 'judge_order_nobail'
  | 'thana_radio'
  | 'bribe_accept'
  | 'bribe_refuse'
  | 'police_warn'
  | 'police_kill'
  | 'police_license_check'
  | 'witness_call_gun'
  | 'witness_call_theft'
  | 'witness_call_assault'
  | 'traffic_no_helmet'
  | 'traffic_no_dl'
  | 'traffic_red_light'
  | 'sacred_ram_mandir'
  | 'sacred_krishna_mandir'
  | 'sacred_mosque'
  | 'street_greet';

const DIALOGUE_POOLS: Record<DialogueCategory, HindiDialoguePair[]> = {
  judge_open: [
    {
      text: 'Court ki karyawahi shuru hoti hai! {stars}★ case mein mulzim kathgare mein khada hai. Inspector, BNS ke tahat aarop pesh karein.',
      tts: 'कोर्ट की कार्यवाही शुरू होती है! {stars} स्टार केस में मुल्ज़िम कठघरे में खड़ा है। इंस्पेक्टर, बीएनएस के तहत आरोप पेश करें।',
    },
    {
      text: 'Order! Order! Session Court ki sunwai aarambh hoti hai. {stars}★ FIR ki chargesheet padhkar sunayi jaaye.',
      tts: 'ऑर्डर! ऑर्डर! सेशन कोर्ट की सुनवाई आरंभ होती है। {stars} स्टार एफआईआर की चार्जशीट पढ़कर सुनाई जाए।',
    },
    {
      text: 'Mulzim ko kathgare mein pesh kiya gaya hai. {stars}★ mamle mein sabhi dharayein aur saboot bench ke saamne rakhein.',
      tts: 'मुल्ज़िम को कठघरे में पेश किया गया है। {stars} स्टार मामले में सभी धाराएँ और सबूत बेंच के सामने रखें।',
    },
    {
      text: 'Nyayalaya mein shanti rakhein! {stars}★ apradh ke aropi par lagaye gaye BNS sections ki pushti ki jaaye.',
      tts: 'न्यायालय में शांति रखें! {stars} स्टार अपराध के आरोपी पर लगाए गए बीएनएस सेक्शन्स की पुष्टि की जाए।',
    },
    {
      text: 'Sunwai shuru! Inspector Vijay Rathore, {stars}★ case ka poora byora aur gawahi court ko batayein.',
      tts: 'सुनवाई शुरू! इंस्पेक्टर विजय राठौड़, {stars} स्टार केस का पूरा ब्योरा और गवाही कोर्ट को बताएं।',
    },
    {
      text: 'Aaj ki pehli sunwai! {stars}★ ke is mukadme mein kanoon ke hisab se dono paksh apni baat rakhein.',
      tts: 'आज की पहली सुनवाई! {stars} स्टार के इस मुकदमे में कानून के हिसाब से दोनों पक्ष अपनी बात रखें।',
    },
    {
      text: 'Court hazir hai. {stars}★ case ke aropi ke khilaf kaun-kaun si BNS dharayein darj hain, pesh karein.',
      tts: 'कोर्ट हाज़िर है। {stars} स्टार केस के आरोपी के खिलाफ कौन-कौन सी बीएनएस धाराएँ दर्ज हैं, पेश करें।',
    },
    {
      text: 'Kanoon ki nazron mein sab barabar hain. Inspector, {stars}★ arrest report aur seizure memo dikhayein.',
      tts: 'कानून की नज़रों में सब बराबर हैं। इंस्पेक्टर, {stars} स्टार अरेस्ट रिपोर्ट और सीज़र मेमो दिखाएँ।',
    },
  ],

  inspector_charge: [
    {
      text: 'Your Honour! Chargesheet mein "{primary}" aur "{secondary}" darj hain. Mulzim ke khilaf pakke gawah aur saboot maujood hain.',
      tts: 'योर ऑनर! चार्जशीट में {primary} और {secondary} दर्ज हैं। मुल्ज़िम के खिलाफ पक्के गवाह और सबूत मौजूद हैं।',
    },
    {
      text: 'Maai-baap, Thana No. 4 ki FIR ke mutabik "{primary}" ke saath "{secondary}" bhi saabit hua hai. CCTV aur gawah saamne hain.',
      tts: 'माई-बाप, थाना नंबर चार की एफआईआर के मुताबिक {primary} के साथ {secondary} भी साबित हुआ है। सीसीटीवी और गवाह सामने हैं।',
    },
    {
      text: 'Judge sahab, humari investigation mein "{primary}" aur "{secondary}" ki pakki tasdeek hui hai. Aropi ko mauke se pakda gaya.',
      tts: 'जज साहब, हमारी इन्वेस्टिगेशन में {primary} और {secondary} की पक्की तस्दीक हुई है। आरोपी को मौके से पकड़ा गया।',
    },
    {
      text: 'Your Honour, police patrol aur aam nagrikon ne "{primary}" dekha. Saath hi "{secondary}" ka jurm bhi BNS ke tahat darj hai.',
      tts: 'योर ऑनर, पुलिस पेट्रोल और आम नागरिकों ने {primary} देखा। साथ ही {secondary} का जुर्म भी बीएनएस के तहत दर्ज है।',
    },
    {
      text: 'Sir, case diary pesh hai — "{primary}" aur "{secondary}" mein mulzim ke khilaf kanooni karwai bilkul jayaz hai.',
      tts: 'सर, केस डायरी पेश है — {primary} और {secondary} में मुल्ज़िम के खिलाफ कानूनी कार्रवाई बिल्कुल जायज़ है।',
    },
    {
      text: 'My Lord, "{primary}" ek gambhir ullanghan hai, aur uske upar "{secondary}" bhi chargesheet mein shamil kiya gaya hai.',
      tts: 'माई लॉर्ड, {primary} एक गंभीर उल्लंघन है, और उसके ऊपर {secondary} भी चार्जशीट में शामिल किया गया है।',
    },
    {
      text: 'Court sahab, witness statements aur wireless log sab "{primary}" aur "{secondary}" ki taraf ishara karte hain.',
      tts: 'कोर्ट साहब, विटनेस स्टेटमेंट्स और वायरलेस लॉग सब {primary} और {secondary} की तरफ इशारा करते हैं।',
    },
    {
      text: 'Your Honour, humne sabhi saboot seal kar diye hain. "{primary}" tatha "{secondary}" dono BNS dharayein lagu hoti hain.',
      tts: 'योर ऑनर, हमने सभी सबूत सील कर दिए हैं। {primary} तथा {secondary} दोनों बीएनएस धाराएँ लागू होती हैं।',
    },
  ],

  vakil_bailable: [
    {
      text: 'Maai-baap, kisi ki jaan nahi gayi hai — yeh chhota bailable maamla hai! Mere client ne galti maani hai, naram zamanat par rihaai di jaaye.',
      tts: 'माई-बाप, किसी की जान नहीं गई है — यह छोटा ज़मानती मामला है! मेरे क्लाइंट ने गलती मानी है, नरम ज़मानत पर रिहाई दी जाए।',
    },
    {
      text: 'Your Honour, BNS ke niyam ke anusar yeh bailable offense hai. Mere client sudharne ko taiyaar hain, kripya sadharan bail manzoor karein.',
      tts: 'योर ऑनर, बीएनएस के नियम के अनुसार यह ज़मानती अपराध है। मेरे क्लाइंट सुधरने को तैयार हैं, कृपया साधारण बेल मंजूर करें।',
    },
    {
      text: 'My Lord, is ghatna mein koi gambhir chot ya hatya nahi hui. Aam halat aur first-time galti dekhkar kam bond par zamanat di jaaye.',
      tts: 'माई लॉर्ड, इस घटना में कोई गंभीर चोट या हत्या नहीं हुई। आम हालात देखकर कम बॉन्ड पर ज़मानत दी जाए।',
    },
    {
      text: 'Judge sahab, mere client shahar ke hi niwasi hain aur bhaagne wale nahi hain. Kripya standard bail bond par riha karne ki kripa karein.',
      tts: 'जज साहब, मेरे क्लाइंट शहर के ही निवासी हैं और भागने वाले नहीं हैं। कृपया स्टैंडर्ड बेल बॉन्ड पर रिहा करने की कृपा करें।',
    },
    {
      text: 'Your Honour, police ne mamuli baat ko bada bana diya hai. Bailable section hone ke naate zamanat humara kanooni adhikar hai.',
      tts: 'योर ऑनर, पुलिस ने मामूली बात को बड़ा बना दिया है। ज़मानती धारा होने के नाते ज़मानत हमारा कानूनी अधिकार है।',
    },
    {
      text: 'Maai-baap, galti anjaane mein hui thi. Client jurmana bharne ko taiyaar hain, kripya chetawani dekar bail de dein.',
      tts: 'माई-बाप, गलती अनजाने में हुई थी। क्लाइंट जुर्माना भरने को तैयार हैं, कृपया चेतावनी देकर बेल दे दें।',
    },
    {
      text: 'My Lord, thodi si laparwahi zaroor hui par niyat kharab nahi thi. Naram drishti se bailable zamanat dene ki prarthana hai.',
      tts: 'माई लॉर्ड, थोड़ी सी लापरवाही ज़रूर हुई पर नीयत ख़राब नहीं थी। नरम दृष्टि से ज़मानत देने की प्रार्थना है।',
    },
    {
      text: 'Judge sahab, client ne thane mein bhi poora sahyog kiya. Kripya niyam anusar zamanat manzoor farmaayein.',
      tts: 'जज साहब, क्लाइंट ने थाने में भी पूरा सहयोग किया। कृपया नियम अनुसार ज़मानत मंजूर फरमाएँ।',
    },
  ],

  vakil_high_bail: [
    {
      text: 'Your Honour, maamla gambhir zaroor hai par koi fatal injury nahi hui. Bhari zamanat rakhkar bail manzoor ki jaaye.',
      tts: 'योर ऑनर, मामला गंभीर ज़रूर है पर कोई जानलेवा नुकसान नहीं हुआ। भारी ज़मानत रखकर बेल मंजूर की जाए।',
    },
    {
      text: 'My Lord, mere client par dabav aur hadbadi ke karan yeh ghatna hui. Heavy surety bond ke saath shartia zamanat di jaaye.',
      tts: 'माई लॉर्ड, मेरे क्लाइंट पर दबाव और हड़बड़ी के कारण यह घटना हुई। भारी बॉन्ड के साथ शर्तिया ज़मानत दी जाए।',
    },
    {
      text: 'Judge sahab, kisi nagrik ki jaan ko khatra nahi pahuncha. Hum bhari zamanat rashi aur vakil fee jama karne ko taiyaar hain.',
      tts: 'जज साहब, किसी नागरिक की जान को ख़तरा नहीं पहुंचा। हम भारी ज़मानत राशि जमा करने को तैयार हैं।',
    },
    {
      text: 'Your Honour, 3-star case mein sakht shartein laga di jaayein, par jail bhejne ke bajaye high bail ka vikalp diya jaaye.',
      tts: 'योर ऑनर, तीन स्टार केस में सख्त शर्तें लगा दी जाएँ, पर जेल भेजने के बजाय हाई बेल का विकल्प दिया जाए।',
    },
    {
      text: 'Maai-baap, police karyawahi ke dauran ghabrahat mein galti hui. Bhari jurmana aur bond lekar ek mauka diya jaaye.',
      tts: 'माई-बाप, पुलिस कार्रवाई के दौरान घबराहट में गलती हुई। भारी जुर्माना और बॉन्ड लेकर एक मौका दिया जाए।',
    },
    {
      text: 'My Lord, court jo bhi sakht shartein aur bhari rashi tay kare, mere client use maanne ko vachanbaddh hain.',
      tts: 'माई लॉर्ड, कोर्ट जो भी सख्त शर्तें और भारी राशि तय करे, मेरे क्लाइंट उसे मानने को वचनबद्ध हैं।',
    },
    {
      text: 'Your Honour, niyam ke mutabik aarop gambhir hain par jamanat ke kabil hain. Kripya high bail order pass karein.',
      tts: 'योर ऑनर, नियम के मुताबिक आरोप गंभीर हैं पर ज़मानत के काबिल हैं। कृपया हाई बेल ऑर्डर पास करें।',
    },
    {
      text: 'Judge sahab, future mein kanoon todne par double saza ki shart par aaj bhari zamanat manzoor kar li jaaye.',
      tts: 'जज साहब, भविष्य में कानून तोड़ने पर दुगनी सज़ा की शर्त पर आज भारी ज़मानत मंजूर कर ली जाए।',
    },
  ],

  vakil_serious: [
    {
      text: 'My Lord, yeh maamla Section 103 BNS ka zaroor hai, par mere client ka kehna hai ki ghatna aatmaraksha aur apratyakshit halaat mein hui. Nyayik dayalu drishti rakhi jaaye.',
      tts: 'माई लॉर्ड, यह मामला सेक्शन एक सौ तीन बीएनएस का ज़रूर है, पर मेरे क्लाइंट का कहना है कि घटना आत्मरक्षा और अप्रत्याशित हालात में हुई।',
    },
    {
      text: 'Your Honour, police ne aatmaraksha ke halaat ko badha-chadhakar dikhaya hai! Poori jaanch hone tak mere client ko kanooni sahayata ka haq milna chahiye.',
      tts: 'योर ऑनर, पुलिस ने आत्मरक्षा के हालात को बढ़ा-चढ़ाकर दिखाया है! मेरे क्लाइंट को कानूनी सहायता का हक मिलना चाहिए।',
    },
    {
      text: 'Maai-baap, hum ghatna ki gambhirta samajhte hain, par chashmdeedon ke bayan mein kafi virodhabhas hai. Kripya nyayik riyayat par vichar karein.',
      tts: 'माई-बाप, हम घटना की गंभीरता समझते हैं, पर चश्मदीदों के बयान में काफी विरोधाभास है। कृपया न्यायिक रियायत पर विचार करें।',
    },
    {
      text: 'My Lord, yeh poorva-niyojit apradh nahi tha — achanak hue jhagde mein bekaabu sthiti ban gayi. Senior Advocate taraf se interim vichar ki guzarish hai.',
      tts: 'माई लॉर्ड, यह पूर्व-नियोजित अपराध नहीं था — अचानक हुए झगड़े में बेकाबू स्थिति बन गई। अंतरिम विचार की गुज़ारिश है।',
    },
    {
      text: 'Judge sahab, aropi ne khud ko kanoon ke hawale kiya hai aur aage trial mein sahyog karega. Kripya sakht sharton ke saath rahat par sochein.',
      tts: 'जज साहब, आरोपी ने खुद को कानून के हवाले किया है और ट्रायल में सहयोग करेगा। कृपया सख्त शर्तों पर सोचें।',
    },
    {
      text: 'Your Honour, ghatna sthal par aatmaraksha ki sthiti paida ho gayi thi. Poora paksh sune bina sakht saza se parivar barbad ho jayega.',
      tts: 'योर ऑनर, घटना स्थल पर आत्मरक्षा की स्थिति पैदा हो गई थी। पूरा पक्ष सुने बिना सख्त सज़ा से परिवार बर्बाद हो जाएगा।',
    },
    {
      text: 'My Lord, hum victim relief fund aur har kanooni shart poori karne ko taiyaar hain agar nyayalaya uchit samjhe.',
      tts: 'माई लॉर्ड, हम पीड़ित सहायता कोष और हर कानूनी शर्त पूरी करने को तैयार हैं अगर न्यायालय उचित समझे।',
    },
    {
      text: 'Judge sahab, apradh gambhir hai par nishpaksh trial tak kanooni vikalp khula rakhna nyay ke siddhant ke anukul hai.',
      tts: 'जज साहब, अपराध गंभीर है पर निष्पक्ष ट्रायल तक कानूनी विकल्प खुला रखना न्याय के सिद्धांत के अनुकूल है।',
    },
  ],

  inspector_rebuttal_fatal: [
    {
      text: 'Sakht aitaraz Your Honour! Section 103 BNS ke tahat {fatalities} jaan gayi hai — aise aropi ko mamuli bail dena nyay aur kanoon ke khilaf hoga!',
      tts: 'सख्त ऐतराज़ योर ऑनर! सेक्शन एक सौ तीन बीएनएस के तहत जान गई है — ऐसे आरोपी को मामूली बेल देना न्याय और कानून के खिलाफ होगा!',
    },
    {
      text: 'Maai-baap, kisi insaan ki jaan lena koi chhota gunah nahi! Section 103 BNS non-bailable hai, iski zamanat kharij honi chahiye!',
      tts: 'माई-बाप, किसी इंसान की जान लेना कोई छोटा गुनाह नहीं! सेक्शन एक सौ तीन बीएनएस नॉन-बेलेबल है, ज़मानत ख़ारिज होनी चाहिए!',
    },
    {
      text: 'Your Honour, sadak par khule-aam jaanleva hamla karke aatmaraksha ka bahana nahi chalega! Public safety ke liye Central Jail bhejna zaroori hai.',
      tts: 'योर ऑनर, सड़क पर खुलेआम जानलेवा हमला करके आत्मरक्षा का बहाना नहीं चलेगा! सेंट्रल जेल भेजना ज़रूरी है।',
    },
    {
      text: 'Judge sahab, {fatalities} ghar ujad gaye is harkat se! Agar aise case mein asaan zamanat mili to kanoon ka khauf khatam ho jayega!',
      tts: 'जज साहब, इस हरकत से घर उजड़ गए! अगर ऐसे केस में आसान ज़मानत मिली तो कानून का खौफ़ ख़तम हो जाएगा!',
    },
    {
      text: 'Objection My Lord! Hathiyar baramad hue hain aur gawahon ke saamne hatya hui hai. Section 103 BNS mein sakht custody mangta hoon!',
      tts: 'ऑब्जेक्शन माई लॉर्ड! हथियार बरामद हुए हैं और गवाहों के सामने हत्या हुई है। सेक्शन एक सौ तीन बीएनएस में सख्त कस्टडी मांगता हूँ!',
    },
    {
      text: 'Your Honour, aropi ne insani zindagi ki parwah nahi ki. BNS ke tahat aisi sangeen dafa mein police is bail plea ka poora virodh karti hai.',
      tts: 'योर ऑनर, आरोपी ने इंसानी ज़िंदगी की परवाह नहीं की। बीएनएस की इस संगीन दफ़ा में पुलिस इस बेल का पूरा विरोध करती है।',
    },
    {
      text: 'Sir, post-mortem aur crime scene report sab saabit kar rahe hain. Yeh hatya ka seedha case hai — bail bilkul nahi milni chahiye!',
      tts: 'सर, पोस्ट-मॉर्टम और क्राइम सीन रिपोर्ट सब साबित कर रहे हैं। यह हत्या का सीधा केस है — बेल बिल्कुल नहीं मिलनी चाहिए!',
    },
    {
      text: 'My Lord, shahar mein aman banaye rakhne ke liye aise khatarnak mulzim ko turant judicial custody mein bhejna behad zaroori hai.',
      tts: 'माई लॉर्ड, शहर में अमन बनाए रखने के लिए ऐसे ख़तरनाक मुल्ज़िम को तुरंत ज्यूडिशियल कस्टडी में भेजना बेहद ज़रूरी है।',
    },
  ],

  inspector_rebuttal_serious: [
    {
      text: 'Sakht aitaraz Your Honour! Mulzim ne SWAT/Army aur kanoon par seedha hamla kiya hai — isko bahar chhodna shehar ke liye khatra hoga!',
      tts: 'सख्त ऐतराज़ योर ऑनर! मुल्ज़िम ने स्वाट आर्मी और कानून पर सीधा हमला किया है — इसको बाहर छोड़ना शहर के लिए ख़तरा होगा!',
    },
    {
      text: 'Judge sahab, police force par firing aur sarkari sampatti ko nuksan pahunchanewale ko jail se kam kuch nahi milna chahiye!',
      tts: 'जज साहब, पुलिस फोर्स पर फायरिंग और सरकारी संपत्ति को नुकसान पहुंचानेवाले को जेल से कम कुछ नहीं मिलना चाहिए!',
    },
    {
      text: 'Your Honour, 4–5 star alert lagana pada isko rokne ke liye! Poora shahar dahshat mein tha, iski zamanat turant kharij ki jaaye.',
      tts: 'योर ऑनर, इसे रोकने के लिए भारी पुलिस बल लगाना पड़ा! पूरा शहर दहशत में था, इसकी ज़मानत तुरंत ख़ारिज की जाए।',
    },
    {
      text: 'My Lord, Section 121 BNS ke tahat duty officers par hamla non-bailable category mein aata hai. Ise seedha Central Jail bheja jaaye!',
      tts: 'माई लॉर्ड, सेक्शन एक सौ इक्कीस बीएनएस के तहत ड्यूटी ऑफिसर्स पर हमला संगीन अपराध है। इसे सीधा सेंट्रल जेल भेजा जाए!',
    },
    {
      text: 'Sir, aropi ne bhaagne aur roadblock todne ki koshish ki. Agar bail mili to yeh dobara shahar mein hungama machayega.',
      tts: 'सर, आरोपी ने भागने और रोडब्लॉक तोड़ने की कोशिश की। अगर बेल मिली तो यह दोबारा शहर में हंगामा मचाएगा।',
    },
    {
      text: 'Your Honour, itne bade paimane par kanoon todne ke baad koi riyayat nahi banti. Police custody aur jail saza hi uchit hai.',
      tts: 'योर ऑनर, इतने बड़े पैमाने पर कानून तोड़ने के बाद कोई रियायत नहीं बनती। जेल की सज़ा ही उचित है।',
    },
    {
      text: 'Court sahab, SWAT team aur patrolling units ki jaan khatre mein daali gayi. Kadi saza hi iska sahi jawab hai!',
      tts: 'कोर्ट साहब, स्वाट टीम और पेट्रोलिंग यूनिट्स की जान ख़तरे में डाली गई। कड़ी सज़ा ही इसका सही जवाब है!',
    },
    {
      text: 'My Lord, saboot pakke hain aur mulzim aadat ke mutabik kanoon todta hai. Non-bailable custody order jaari kiya jaaye.',
      tts: 'माई लॉर्ड, सबूत पक्के हैं और मुल्ज़िम बार-बार कानून तोड़ता है। नॉन-बेलेबल कस्टडी ऑर्डर जारी किया जाए।',
    },
  ],

  inspector_rebuttal_normal: [
    {
      text: 'Court sahab, BNS niyamon ke mutabik shehar mein kanoon-vyavastha banaye rakhne ke liye is par uchit jurmana lagna zaroori hai.',
      tts: 'कोर्ट साहब, बीएनएस नियमों के मुताबिक शहर में कानून-व्यवस्था बनाए रखने के लिए इस पर उचित जुर्माना लगना ज़रूरी है।',
    },
    {
      text: 'Your Honour, chahe maamla bailable ho, par sadak par anushasan rakhne ke liye sakht chetawani aur bond zaroori hai.',
      tts: 'योर ऑनर, चाहे मामला ज़मानती हो, पर सड़क पर अनुशासन रखने के लिए सख्त चेतावनी और बॉन्ड ज़रूरी है।',
    },
    {
      text: 'Sir, public ki suraksha aur traffic niyamon ka samman zaroori hai — aropi se poora bail bond vasoola jaaye.',
      tts: 'सर, पब्लिक की सुरक्षा और ट्रैफिक नियमों का सम्मान ज़रूरी है — आरोपी से पूरा बेल बॉन्ड वसूला जाए।',
    },
    {
      text: 'Judge sahab, police record mein yeh entry darj ho aur shart rakhi jaaye ki mulzim dobara aisi galti nahi karega.',
      tts: 'जज साहब, पुलिस रिकॉर्ड में यह एंट्री दर्ज हो और शर्त रखी जाए कि मुल्ज़िम दोबारा ऐसी गलती नहीं करेगा।',
    },
    {
      text: 'Your Honour, hum kanooni prakriya se sehmat hain, bas uchit jurmana aur vakil/court shulk tay kar diya jaaye.',
      tts: 'योर ऑनर, हम कानूनी प्रक्रिया से सहमत हैं, बस उचित जुर्माना और कोर्ट शुल्क तय कर दिया जाए।',
    },
    {
      text: 'My Lord, BNS ke tahat jurmana bharne par hi mulzim ko samajhdaar sabak milega. Kripya record par warning darj karein.',
      tts: 'माई लॉर्ड, बीएनएस के तहत जुर्माना भरने पर ही मुल्ज़िम को सबक मिलेगा। कृपया रिकॉर्ड पर चेतावनी दर्ज करें।',
    },
    {
      text: 'Sir, aropi par nigrani rakhi jayegi. Court ke aadesh ka thane mein poora palan karwaya jayega.',
      tts: 'सर, आरोपी पर निगरानी रखी जाएगी। कोर्ट के आदेश का थाने में पूरा पालन करवाया जाएगा।',
    },
    {
      text: 'Your Honour, aage se agar isne kanoon toda to sakht karwai hogi — is chetawani ke saath court ka faisla manzoor hai.',
      tts: 'योर ऑनर, आगे से अगर इसने कानून तोड़ा तो सख्त कार्रवाई होगी — इस चेतावनी के साथ कोर्ट का फैसला मंजूर है।',
    },
  ],

  judge_order_fatal: [
    {
      text: 'Kisi ki jaan lena koi mamuli baat nahi hai, Section 103 BNS [IPC 302] ek gambhir non-bailable apradh hai! Zamanat kharij! Mulzim ko {jailDays} din Bharat Central Jail bheja jaata hai.{interimNote}',
      tts: 'किसी की जान लेना कोई मामूली बात नहीं है, सेक्शन एक सौ तीन बीएनएस एक गंभीर नॉन-बेलेबल अपराध है! ज़मानत ख़ारिज! मुल्ज़िम को {jailDayWords} भारत सेंट्रल जेल भेजा जाता है!',
    },
    {
      text: 'Court sunati hai apna faisla: Insani jaan ki keemat sabse upar hai! Section 103 BNS ke tahat bail namanzoor — {jailDays} din ki judicial custody di jaati hai.{interimNote}',
      tts: 'कोर्ट सुनाती है अपना फैसला: इंसानी जान की कीमत सबसे ऊपर है! सेक्शन एक सौ तीन बीएनएस के तहत बेल नामंजूर — {jailDayWords} की ज्यूडिशियल कस्टडी दी जाती है।',
    },
    {
      text: 'Order! Hatya jaise sangeen jurm mein mamuli rihaai mumkin nahi! Zamanat kharij ki jaati hai — aropi ko {jailDays} din Bharat Central Jail mein rehna hoga.{interimNote}',
      tts: 'ऑर्डर! हत्या जैसे संगीन जुर्म में मामूली रिहाई मुमकिन नहीं! ज़मानत ख़ारिज की जाती है — आरोपी को {jailDayWords} भारत सेंट्रल जेल में रहना होगा।',
    },
    {
      text: 'Nyayalaya ka spasht mat hai ki Section 103 BNS mein shahar ki suraksha sarvopari hai. Bail plea kharij! {jailDays} din Bharat Central Jail ka aadesh.{interimNote}',
      tts: 'न्यायालय का स्पष्ट मत है कि सेक्शन एक सौ तीन बीएनएस में शहर की सुरक्षा सर्वोपरि है। बेल ख़ारिज! {jailDayWords} भारत सेंट्रल जेल का आदेश।',
    },
    {
      text: 'Gawahon aur sabooton ke aadhar par Section 103 BNS lagoo hota hai. Zamanat asweekar! Mulzim ko turant {jailDays} din Central Jail bheja jaaye.{interimNote}',
      tts: 'गवाहों और सबूतों के आधार पर सेक्शन एक सौ तीन बीएनएस लागू होता है। ज़मानत अस्वीकार! मुल्ज़िम को तुरंत {jailDayWords} सेंट्रल जेल भेजा जाए।',
    },
    {
      text: 'Kanoon kisi ke haath ka khilona nahi! Jaan lene ke is apradh par {jailDays} din ki Bharat Central Jail custody tay ki jaati hai. Zamanat kharij!{interimNote}',
      tts: 'कानून किसी के हाथ का खिलौना नहीं! जान लेने के इस अपराध पर {jailDayWords} की भारत सेंट्रल जेल कस्टडी तय की जाती है। ज़मानत ख़ारिज!',
    },
    {
      text: 'Session Court aadesh deti hai: Section 103 BNS [IPC 302] gair-zamanati hai — {jailDays} din Central Jail mein kaid bhugatni hogi.{interimNote}',
      tts: 'सेशन कोर्ट आदेश देती है: सेक्शन एक सौ तीन बीएनएस गैर-ज़मानती है — {jailDayWords} सेंट्रल जेल में क़ैद भुगतनी होगी।',
    },
    {
      text: 'Sabhi pakshon ko sunne ke baad bench ka faisla: Hatya ke aarop mein bail nahi mil sakti. {jailDays} din Bharat Central Jail bheja jaata hai.{interimNote}',
      tts: 'सभी पक्षों को सुनने के बाद बेंच का फैसला: हत्या के आरोप में बेल नहीं मिल सकती। {jailDayWords} भारत सेंट्रल जेल भेजा जाता है।',
    },
  ],

  judge_order_bail: [
    {
      text: 'Kisi jaan ka nuksan na hone ke karan BNS ke tahat bailable maamla maankar: {bailRs} Bail Bond aur {lawyerRs} Vakil Fee par Zamanat Manzoor ki jaati hai!',
      tts: 'सभी पक्षों को सुनने के बाद: {bailWords} बेल बॉन्ड और {lawyerWords} वकील फीस पर ज़मानत मंजूर की जाती है!',
    },
    {
      text: 'Order! Yeh bailable offense hai — court sakht chetawani deti hai ki aage se kanoon na todein. {bailRs} Bond + {lawyerRs} Vakil Fee par Bail Granted!',
      tts: 'ऑर्डर! यह ज़मानती अपराध है — कोर्ट सख्त चेतावनी देती है कि आगे से कानून ना तोड़ें। {bailWords} बॉन्ड और {lawyerWords} वकील फीस पर बेल मंजूर!',
    },
    {
      text: 'Court apna aadesh sunati hai: {bailRs} ki zamanat rashi aur {lawyerRs} vakil shulk jama karne par aropi ko turant riha kiya jaaye!',
      tts: 'कोर्ट अपना आदेश सुनाती है: {bailWords} की ज़मानत राशि और {lawyerWords} वकील शुल्क जमा करने पर आरोपी को तुरंत रिहा किया जाए!',
    },
    {
      text: 'BNS ki naram dharaon ke tahat aropi ko ek sudharne ka mauka diya jaata hai. {bailRs} Bail Bond aur {lawyerRs} Vakil Fee par Zamanat Manzoor!',
      tts: 'बीएनएस की नरम धाराओं के तहत आरोपी को सुधरने का मौका दिया जाता है। {bailWords} बेल बॉन्ड और {lawyerWords} वकील फीस पर ज़मानत मंजूर!',
    },
    {
      text: 'Zamanat manzoor ki jaati hai! {bailRs} bond aur {lawyerRs} legal fee bharne ke baad Police Van aapko Thana gate par chhod degi.',
      tts: 'ज़मानत मंजूर की जाती है! {bailWords} बॉन्ड और {lawyerWords} लीगल फीस भरने के बाद पुलिस वैन आपको थाने के गेट पर छोड़ देगी।',
    },
    {
      text: 'Bench ka faisla: Chhota bailable apradh hone ke karan {bailRs} Bond + {lawyerRs} Vakil Fee par bail di jaati hai. Shanti banaye rakhein!',
      tts: 'बेंच का फैसला: छोटा ज़मानती अपराध होने के कारण {bailWords} बॉन्ड और {lawyerWords} वकील फीस पर बेल दी जाती है। शांति बनाए रखें!',
    },
    {
      text: 'Sadharan zamanat swikar! Mulzim {bailRs} court bond aur {lawyerRs} vakil fee jama kare ya Central Jail mein saza poori kare.',
      tts: 'साधारण ज़मानत स्वीकार! मुल्ज़िम {bailWords} कोर्ट बॉन्ड और {lawyerWords} वकील फीस जमा करे या सेंट्रल जेल में सज़ा पूरी करे।',
    },
    {
      text: 'Kanoon ka samman karein aur dobara galti na dohrayein! {bailRs} Bail Bond + {lawyerRs} Vakil Fee ke saath aapki zamanat manzoor hai.',
      tts: 'कानून का सम्मान करें और दोबारा गलती ना दोहराएँ! {bailWords} बेल बॉन्ड और {lawyerWords} वकील फीस के साथ आपकी ज़मानत मंजूर है।',
    },
  ],

  judge_order_high_bail: [
    {
      text: 'Aaropon ki gambhirta dekhte hue: {bailRs} Bhari Zamanat + {lawyerRs} Vakil Fee bharo, warna {jailDays} din Bharat Central Jail!',
      tts: 'आरोपों की गंभीरता देखते हुए: {bailWords} भारी ज़मानत और {lawyerWords} वकील फीस भरो, वरना {jailDayWords} भारत सेंट्रल जेल!',
    },
    {
      text: 'Order! 3-Star sangeen case mein sadharan bail nahi milegi. {bailRs} Heavy Bond + {lawyerRs} Vakil Fee chukao ya {jailDays} din Jail jao!',
      tts: 'ऑर्डर! तीन स्टार संगीन केस में साधारण बेल नहीं मिलेगी। {bailWords} हेवी बॉन्ड और {lawyerWords} वकील फीस चुकाओ या {jailDayWords} जेल जाओ!',
    },
    {
      text: 'Court aadesh deti hai: Section 121 / 303 BNS ke tahat {bailRs} bhari zamanat aur {lawyerRs} fees par shartia bail manzoor, anyatha {jailDays} din custody!',
      tts: 'कोर्ट आदेश देती है: {bailWords} भारी ज़मानत और {lawyerWords} फीस पर शर्तिया बेल मंजूर, अन्यथा {jailDayWords} की जेल कस्टडी!',
    },
    {
      text: 'Mulzim ko aakhri chetawani! {bailRs} Bhari Zamanat rashi aur {lawyerRs} Vakil Fee bharne par hi rihaai milegi, warna {jailDays} din Central Jail!',
      tts: 'मुल्ज़िम को आख़िरी चेतावनी! {bailWords} भारी ज़मानत राशि और {lawyerWords} वकील फीस भरने पर ही रिहाई मिलेगी, वरना {jailDayWords} सेंट्रल जेल!',
    },
    {
      text: 'High Bail Order pass hota hai: {bailRs} surety bond + {lawyerRs} advocate fee jama karein, ya {jailDays} din Bharat Central Jail bheja jayega.',
      tts: 'हाई बेल ऑर्डर पास होता है: {bailWords} बॉन्ड और {lawyerWords} वकील फीस जमा करें, या {jailDayWords} भारत सेंट्रल जेल भेजा जाएगा।',
    },
    {
      text: 'Kanoon par hamla aur sampatti nuksan halke mein nahi liya jayega. {bailRs} bond + {lawyerRs} fee jama karo, warna {jailDays} din jail pakki!',
      tts: 'कानून पर हमला और संपत्ति नुकसान हल्के में नहीं लिया जाएगा। {bailWords} बॉन्ड और {lawyerWords} फीस जमा करो, वरना {jailDayWords} जेल पक्की!',
    },
    {
      text: 'Bench ka aadesh: Bhari sharton ke saath {bailRs} bail + {lawyerRs} fees tay ki jaati hai. Na bharne par {jailDays} din judicial custody!',
      tts: 'बेंच का आदेश: भारी शर्तों के साथ {bailWords} बेल और {lawyerWords} फीस तय की जाती है। ना भरने पर {jailDayWords} ज्यूडिशियल कस्टडी!',
    },
    {
      text: 'Zamanat mehengi hai kyunki jurm bada hai! {bailRs} Heavy Bond aur {lawyerRs} Vakil Fee bharo ya {jailDays} din Central Jail mein bitao.',
      tts: 'ज़मानत महंगी है क्योंकि जुर्म बड़ा है! {bailWords} हेवी बॉन्ड और {lawyerWords} वकील फीस भरो या {jailDayWords} सेंट्रल जेल में बिताओ।',
    },
  ],

  judge_order_nobail: [
    {
      text: 'Sangeen aur gair-zamanati aarop saabit! Zamanat kharij! Mulzim ko seedha {jailDays} din Bharat Central Jail bheja jaata hai!',
      tts: 'संगीन और गैर-ज़मानती आरोप साबित! ज़मानत ख़ारिज! मुल्ज़िम को सीधा {jailDayWords} भारत सेंट्रल जेल भेजा जाता है!',
    },
    {
      text: 'Order! SWAT aur Army ke khilaf khule-aam bagawat karne wale ko bail nahi mil sakti! {jailDays} din Bharat Central Jail custody!',
      tts: 'ऑर्डर! स्वाट और आर्मी के खिलाफ खुलेआम बगावत करने वाले को बेल नहीं मिल सकती! {jailDayWords} भारत सेंट्रल जेल कस्टडी!',
    },
    {
      text: 'Court ki sunwai samapt! Yeh 4–5★ non-bailable case hai — zamanat namanzoor! Aropi ko {jailDays} din Central Jail bheja jaaye!',
      tts: 'कोर्ट की सुनवाई समाप्त! यह नॉन-बेलेबल केस है — ज़मानत नामंजूर! आरोपी को {jailDayWords} सेंट्रल जेल भेजा जाए!',
    },
    {
      text: 'Koi riyayat nahi! Kanoon aur suraksha balon par hamle ke liye {jailDays} din ki kathor Bharat Central Jail custody ka aadesh!',
      tts: 'कोई रियायत नहीं! कानून और सुरक्षा बलों पर हमले के लिए {jailDayWords} की कठोर भारत सेंट्रल जेल कस्टडी का आदेश!',
    },
    {
      text: 'Zamanat arzi kharij ki jaati hai! Mulzim ko hathkadi lagakar Police Van se seedha {jailDays} din ke liye Central Jail bhejo!',
      tts: 'ज़मानत अर्ज़ी ख़ारिज की जाती है! मुल्ज़िम को हथकड़ी लगाकर पुलिस वैन से सीधा {jailDayWords} के लिए सेंट्रल जेल भेजो!',
    },
    {
      text: 'Shahari suraksha ke liye yeh aadesh avashyak hai — Non-Bailable Warrant! {jailDays} din Bharat Central Jail mein bitao!',
      tts: 'शहरी सुरक्षा के लिए यह आदेश आवश्यक है — नॉन-बेलेबल वारंट! {jailDayWords} भारत सेंट्रल जेल में बिताओ!',
    },
    {
      text: 'Bench ekmat hai: Itne sangeen aaropon mein bail sambhav nahi. Mulzim ko {jailDays} din ke liye Bharat Central Jail bheja jaata hai!',
      tts: 'बेंच एकमत है: इतने संगीन आरोपों में बेल संभव नहीं। मुल्ज़िम को {jailDayWords} के लिए भारत सेंट्रल जेल भेजा जाता है!',
    },
    {
      text: 'Faisla sunaya gaya! Non-bailable apradh saabit hone par {jailDays} din ki judicial custody Bharat Central Jail mein bhugatni hogi!',
      tts: 'फैसला सुनाया गया! नॉन-बेलेबल अपराध साबित होने पर {jailDayWords} की ज्यूडिशियल कस्टडी भारत सेंट्रल जेल में भुगतनी होगी!',
    },
  ],

  thana_radio: [
    {
      text: 'Control Room Alpha-4: Sabhi beat constables dhyan dein, Bharat Chowk aur Bank Road par patrolling tez rakhein — over!',
      tts: 'कंट्रोल रूम अल्फा चार: सभी बीट कॉन्स्टेबल्स ध्यान दें, भारत चौक और बैंक रोड पर पेट्रोलिंग तेज़ रखें — ओवर!',
    },
    {
      text: 'PCR Delta-2 report: Azad Chowk aur Subhash Chowk signal par traffic normal hai, helmet checking jaari — over!',
      tts: 'पीसीआर डेल्टा दो रिपोर्ट: आज़ाद चौक और सुभाष चौक सिग्नल पर ट्रैफिक नॉर्मल है, हेलमेट चेकिंग जारी — ओवर!',
    },
    {
      text: 'Thana No. 4 Duty Desk: Royal Bank Of India ke paas security alert normal, armored guard duty par hai — over!',
      tts: 'थाना नंबर चार ड्यूटी डेस्क: रॉयल बैंक ऑफ़ इंडिया के पास सिक्योरिटी अलर्ट नॉर्मल, गार्ड ड्यूटी पर है — ओवर!',
    },
    {
      text: 'Wireless Unit Charlie: District Court ke bahar vakilon aur fariyadiyon ki bheed badh rahi hai, gate check karein!',
      tts: 'वायरलेस यूनिट चार्ली: डिस्ट्रिक्ट कोर्ट के बाहर वकीलों और फरियादियों की भीड़ बढ़ रही है, गेट चेक करें!',
    },
    {
      text: 'Central Jail Tower-1: East Gate aur drainage grate par spotlight check ok, koi suspicious halchal nahi — over!',
      tts: 'सेंट्रल जेल टावर एक: ईस्ट गेट और ड्रेनेज ग्रेट पर स्पॉटलाइट चेक ठीक है, कोई संदिग्ध हलचल नहीं — ओवर!',
    },
    {
      text: 'Mobile Van Bravo-7: Pankaj Shastra Bhandar ke paas bina license hathiyar dikhane walon par nazar rakhein — over!',
      tts: 'मोबाइल वैन ब्रावो सात: पंकज शस्त्र भंडार के पास बिना लाइसेंस हथियार दिखाने वालों पर नज़र रखें — ओवर!',
    },
    {
      text: 'Control Room HQ: Sabhi units ko suchna — 100 number ki emergency calls par 5 second mein response dein!',
      tts: 'कंट्रोल रूम हेडक्वार्टर: सभी यूनिट्स को सूचना — सौ नंबर की इमरजेंसी कॉल्स पर तुरंत रिस्पॉन्स दें!',
    },
    {
      text: 'Traffic Control Eagle-3: Gandhi Chowk par laal batti todne walon ka turant e-challan aur whistle bajayein — over!',
      tts: 'ट्रैफिक कंट्रोल ईगल तीन: गांधी चौक पर लाल बत्ती तोड़ने वालों का तुरंत चालान और सीटी बजाएँ — ओवर!',
    },
    {
      text: 'Thana Lockup Guard: Havalat ke sabhi kaidiyon ki haziri poori hai, Court Van shift ke liye taiyaar hai!',
      tts: 'थाना लॉकअप गार्ड: हवालात के सभी क़ैदियों की हाज़िरी पूरी है, कोर्ट वैन शिफ्ट के लिए तैयार है!',
    },
    {
      text: 'Night Squad Echo-9: Residential colony aur Noor Masjid / Ram Mandir chaurahe par shanti aur patrolling ok — over!',
      tts: 'नाइट स्क्वाड ईको नौ: रेज़िडेंशियल कॉलोनी और मंदिर-मस्जिद चौराहे पर शांति और पेट्रोलिंग ठीक है — ओवर!',
    },
  ],

  bribe_accept: [
    {
      text: 'Chalo bhai, aaj jaane deta hoon... aage se dhyan rakhna!',
      tts: 'चलो भाई, आज जाने देता हूँ... आगे से ध्यान रखना!',
    },
    {
      text: 'Theek hai, chai-paani rakh liya... ab jaldi se yahan se nikal le!',
      tts: 'ठीक है, चाय-पानी रख लिया... अब जल्दी से यहाँ से निकल ले!',
    },
    {
      text: 'Chal is baar report nahi likh raha, par dubara lafda mat karna!',
      tts: 'चल इस बार रिपोर्ट नहीं लिख रहा, पर दुबारा लफड़ा मत करना!',
    },
    {
      text: 'Baat yahin rafa-dafa samjho... ab seedhe ghar jaao bina shor kiye!',
      tts: 'बात यहीं रफ़ा-दफ़ा समझो... अब सीधे घर जाओ बिना शोर किए!',
    },
    {
      text: 'Acha baba, setting ho gayi. Wireless pe clear bol deta hoon, nikal ja!',
      tts: 'अच्छा बाबा, सेटिंग हो गई। वायरलेस पे क्लियर बोल देता हूँ, निकल जा!',
    },
    {
      text: 'Pehli aur aakhri baar maaf kar raha hoon... samjha na? Chal bhaag yahan se!',
      tts: 'पहली और आख़िरी बार माफ कर रहा हूँ... समझा ना? चल भाग यहाँ से!',
    },
    {
      text: 'Chalo kharcha-paani mil gaya, file band samjho! Aage se kanoon mat todna!',
      tts: 'चलो ख़र्चा-पानी मिल गया, फाइल बंद समझो! आगे से कानून मत तोड़ना!',
    },
    {
      text: 'Sahi waqt par samajhdari dikha di tune... ja, aaj koi case nahi banega!',
      tts: 'सही वक़्त पर समझदारी दिखा दी तूने... जा, आज कोई केस नहीं बनेगा!',
    },
    {
      text: 'Thik hai bhai, jeb mein daal liya — ab gaadi sambhal ke chalana!',
      tts: 'ठीक है भाई, जेब में डाल लिया — अब गाड़ी संभाल के चलाना!',
    },
    {
      text: 'Matter closed! Ab thode der shaant rehna warna dusra inspector pakad lega!',
      tts: 'मैटर क्लोज़्ड! अब थोड़ी देर शांत रहना वरना दूसरा इंस्पेक्टर पकड़ लेगा!',
    },
  ],

  bribe_refuse: [
    {
      text: 'Mujhe rishwat deta hai?! Badtameez, ab seedha lockup chal!',
      tts: 'मुझे रिश्वत देता है?! बदतमीज़, अब सीधा लॉकअप चल!',
    },
    {
      text: 'Imaandar policewala hoon! Tere note mere usool nahi kharid sakte — pakdo isko!',
      tts: 'ईमानदार पुलिसवाला हूँ! तेरे नोट मेरे उसूल नहीं खरीद सकते — पकड़ो इसको!',
    },
    {
      text: 'Chai-paani ki baat karta hai?! Sarkari duty mein rishwat ki koshish — case double hoga!',
      tts: 'चाय-पानी की बात करता है?! सरकारी ड्यूटी में रिश्वत की कोशिश — केस डबल होगा!',
    },
    {
      text: 'Himmat kaise hui paise dikhane ki?! Ab court mein judge ke saamne safai dena!',
      tts: 'हिम्मत कैसे हुई पैसे दिखाने की?! अब कोर्ट में जज के सामने सफ़ाई देना!',
    },
    {
      text: 'Yeh purana zamana nahi hai bhai! Bodycam chal raha hai, ab rishwat ke jurm mein bhi fass gaya tu!',
      tts: 'यह पुराना ज़माना नहीं है भाई! बॉडीकैम चल रहा है, अब रिश्वत के जुर्म में भी फंस गया तू!',
    },
    {
      text: 'Apni jeb mein rakh yeh paise! Kanoon bikta nahi hai — backup bula raha hoon!',
      tts: 'अपनी जेब में रख यह पैसे! कानून बिकता नहीं है — बैकअप बुला रहा हूँ!',
    },
    {
      text: 'Galti upar se rishwat ki peshkash?! Aaj to teri pakki khatirdari thane mein hogi!',
      tts: 'गलती ऊपर से रिश्वत की पेशकश?! आज तो तेरी पक्की खातिरदारी थाने में होगी!',
    },
    {
      text: 'Naam kharab mat kar vardi ka! Ek star aur badh raha hai tere upar, haath upar kar!',
      tts: 'नाम ख़राब मत कर वर्दी का! एक स्टार और बढ़ रहा है तेरे ऊपर, हाथ ऊपर कर!',
    },
    {
      text: 'Yeh note kisi aur ko dikhana! Yahan sirf kanoon ka danda chalta hai!',
      tts: 'यह नोट किसी और को दिखाना! यहाँ सिर्फ कानून का डंडा चलता है!',
    },
    {
      text: 'Rishwat dekar bachna chahta hai? Control room, extra force bhejo yahan!',
      tts: 'रिश्वत देकर बचना चाहता है? कंट्रोल रूम, एक्स्ट्रा फोर्स भेजो यहाँ!',
    },
  ],

  police_warn: [
    {
      text: 'Haath upar kar! Wahin ruk ja!',
      tts: 'हाथ ऊपर कर! वहीं रुक जा!',
    },
    {
      text: 'Pakdo isko! Police se bhaag raha hai!',
      tts: 'पकड़ो इसको! पुलिस से भाग रहा है!',
    },
    {
      text: 'Police! Chup-chaap ruk ja warna lathi-charge hoga!',
      tts: 'पुलिस! चुपचाप रुक जा वरना लाठीचार्ज होगा!',
    },
    {
      text: 'Oye! Kahan bhaag raha hai? Gher lo isko charo taraf se!',
      tts: 'ओये! कहाँ भाग रहा है? घेर लो इसको चारों तरफ से!',
    },
    {
      text: 'Bharat Police alert! Turant surrender karo, bhaagne ka koi faayda nahi!',
      tts: 'भारत पुलिस अलर्ट! तुरंत सरेंडर करो, भागने का कोई फायदा नहीं!',
    },
    {
      text: 'Ruk ja bhai! Kanoon se tez koi nahi bhaag sakta — hathiyar neeche rakh!',
      tts: 'रुक जा भाई! कानून से तेज़ कोई नहीं भाग सकता — हथियार नीचे रख!',
    },
    {
      text: 'Control room, suspect is chowk par dikha hai — sabhi gadiyan rasta block karein!',
      tts: 'कंट्रोल रूम, संदिग्ध इस चौक पर दिखा है — सभी गाड़ियाँ रास्ता ब्लॉक करें!',
    },
    {
      text: 'Aakhri chetawani de raha hoon! Gaadi side mein rok aur bahar aaja!',
      tts: 'आख़िरी चेतावनी दे रहा हूँ! गाड़ी साइड में रोक और बाहर आजा!',
    },
    {
      text: 'Siren sunai nahi de raha kya?! Rasta mat roko, wahin khade ho jaao!',
      tts: 'सायरन सुनाई नहीं दे रहा क्या?! रास्ता मत रोको, वहीं खड़े हो जाओ!',
    },
    {
      text: 'Thane se extra force aa rahi hai — chup-chaap haath upar kar lo!',
      tts: 'थाने से एक्स्ट्रा फोर्स आ रही है — चुपचाप हाथ ऊपर कर लो!',
    },
  ],

  police_kill: [
    {
      text: 'Bhaagne ki koshish kar raha tha? Ab padha reh sadak pe!',
      tts: 'भागने की कोशिश कर रहा था? अब पड़ा रह सड़क पे!',
    },
    {
      text: 'Kanoon se bachega? Tera khel khatam ho gaya!',
      tts: 'कानून से बचेगा? तेरा खेल ख़तम हो गया!',
    },
    {
      text: 'Ruk bola tha na... ab bhugat!',
      tts: 'रुक बोला था ना... अब भुगत!',
    },
    {
      text: 'Police se panga bahut mehenga pad gaya!',
      tts: 'पुलिस से पंगा बहुत महंगा पड़ गया!',
    },
    {
      text: 'Kanoon ke haath bahut lambe hote hain — aaj sabak mil gaya!',
      tts: 'कानून के हाथ बहुत लंबे होते हैं — आज सबक मिल गया!',
    },
    {
      text: 'Itni baar warning di, fir bhi goli chalayi? Ab ambulance bulao iske liye!',
      tts: 'इतनी बार चेतावनी दी, फिर भी गोली चलाई? अब एम्बुलेंस बुलाओ इसके लिए!',
    },
    {
      text: 'Suspect neutralized! Control room, hospital van bhejo yahan!',
      tts: 'सस्पेक्ट न्यूट्रलाइज़्ड! कंट्रोल रूम, हॉस्पिटल वैन भेजो यहाँ!',
    },
    {
      text: 'Vardi se takrane ka anjaam yahi hota hai — mission clear!',
      tts: 'वर्दी से टकराने का अंजाम यही होता है — मिशन क्लियर!',
    },
    {
      text: 'Shahar mein goondagardi nahi chalegi — suspect down!',
      tts: 'शहर में गुंडागर्दी नहीं चलेगी — सस्पेक्ट डाउन!',
    },
    {
      text: 'Samjhaya tha surrender kar de... par tune apna hi nuksan kar liya!',
      tts: 'समझाया था सरेंडर कर दे... पर तूने अपना ही नुकसान कर लिया!',
    },
  ],

  police_license_check: [
    {
      text: 'Ruko! Apna arms license dikhao!',
      tts: 'रुको! अपना आर्म्स लाइसेंस दिखाओ!',
    },
    {
      text: 'Oye bhai sahab, khule mein banduk leke ghoom rahe ho? Valid license paper dikhao!',
      tts: 'ओये भाई साहब, खुले में बंदूक लेके घूम रहे हो? वैध लाइसेंस पेपर दिखाओ!',
    },
    {
      text: 'Halt! Bharat Police checking chal rahi hai — apna DM Arms License card pesh karo!',
      tts: 'हॉल्ट! भारत पुलिस चेकिंग चल रही है — अपना डीएम आर्म्स लाइसेंस कार्ड पेश करो!',
    },
    {
      text: 'Ruk jaao! Kisi ne 100 number par hathiyar ki shikayat ki hai, license check karwao.',
      tts: 'रुक जाओ! किसी ने सौ नंबर पर हथियार की शिकायत की है, लाइसेंस चेक करवाओ।',
    },
    {
      text: 'Banduk neeche rakho aur pehle apna valid gun permit dikhao!',
      tts: 'बंदूक नीचे रखो और पहले अपना वैध गन परमिट दिखाओ!',
    },
    {
      text: 'Checking! Bazaar mein asla rakhne ka adhikaar hai tumhare paas? Kagaz nikalo!',
      tts: 'चेकिंग! बाज़ार में असला रखने का अधिकार है तुम्हारे पास? कागज़ निकालो!',
    },
    {
      text: 'Officer on duty! Apna arms license verify karwao warna Arms Act lag jayega!',
      tts: 'ऑफिसर ऑन ड्यूटी! अपना आर्म्स लाइसेंस वेरिफाई करवाओ वरना आर्म्स एक्ट लग जाएगा!',
    },
    {
      text: 'Bhai sahab side mein aaiye — gun license aur ID dikhane ke baad hi aage jaane milega.',
      tts: 'भाई साहब साइड में आइए — गन लाइसेंस और आईडी दिखाने के बाद ही आगे जाने मिलेगा।',
    },
  ],

  witness_call_gun: [
    {
      text: 'Bhai, ye banduk... main abhi police ko bulata hoon!',
      tts: 'भाई, ये बंदूक... मैं अभी पुलिस को बुलाता हूँ!',
    },
    {
      text: 'Are baap re! Iske haath mein banduk hai... 100 number milao!',
      tts: 'अरे बाप रे! इसके हाथ में बंदूक है... सौ नंबर मिलाओ!',
    },
    {
      text: 'Police ko phone karo! Yahan khule-aam hathiyar dikha raha hai!',
      tts: 'पुलिस को फोन करो! यहाँ खुलेआम हथियार दिखा रहा है!',
    },
    {
      text: 'Hello Thana No. 4? Bazaar mein ek aadmi banduk leke ghoom raha hai, jaldi aao!',
      tts: 'हेलो थाना नंबर चार? बाज़ार में एक आदमी बंदूक लेके घूम रहा है, जल्दी आओ!',
    },
    {
      text: 'Sab door hato! Iske paas asla hai — main 100 dial kar raha hoon!',
      tts: 'सब दूर हटो! इसके पास असला है — मैं सौ डायल कर रहा हूँ!',
    },
    {
      text: 'Haye ram! Din-dahade goli chalane ki dhamki de raha hai, police ko bulao!',
      tts: 'हाय राम! दिन-दहाड़े गोली चलाने की धमकी दे रहा है, पुलिस को बुलाओ!',
    },
    {
      text: 'Control room, jaldi patrol van bhejo! Yahan public mein gun dikhayi ja rahi hai!',
      tts: 'कंट्रोल रूम, जल्दी पेट्रोल वैन भेजो! यहाँ पब्लिक में गन दिखाई जा रही है!',
    },
    {
      text: 'Arre darwaza band karo bhai, ye banda hathiyar leke ghoom raha — 100 par call lag gaya!',
      tts: 'अरे दरवाज़ा बंद करो भाई, ये बंदा हथियार लेके घूम रहा — सौ पर कॉल लग गया!',
    },
  ],

  witness_call_theft: [
    {
      text: 'Oye! Ye gaadi chura raha hai... abhi 100 number lagata hoon!',
      tts: 'ओये! ये गाड़ी चुरा रहा है... अभी सौ नंबर लगाता हूँ!',
    },
    {
      text: 'Chor! Gaadi chura ke le gaya, police ko phone karo!',
      tts: 'चोर! गाड़ी चुरा के ले गया, पुलिस को फोन करो!',
    },
    {
      text: 'Hello Police? Meri aankhon ke saamne rickshaw/car chori ho gayi, jaldi pakdo!',
      tts: 'हेलो पुलिस? मेरी आँखों के सामने गाड़ी चोरी हो गई, जल्दी पकड़ो!',
    },
    {
      text: 'Pakdo pakdo! Isne zabardasti driver ko bahar nikal kar gaadi chheen li!',
      tts: 'पकड़ो पकड़ो! इसने ज़बरदस्ती ड्राइवर को बाहर निकाल कर गाड़ी छीन ली!',
    },
    {
      text: '100 number lag gaya hai! Gaadi ka number police ko bata raha hoon!',
      tts: 'सौ नंबर लग गया है! गाड़ी का नंबर पुलिस को बता रहा हूँ!',
    },
    {
      text: 'Arre bhai ki gaadi uda le gaya! Chowk par police ko wireless karwa raha hoon!',
      tts: 'अरे भाई की गाड़ी उड़ा ले गया! चौक पर पुलिस को वायरलेस करवा रहा हूँ!',
    },
    {
      text: 'Chor-chor! Din-dahade sadak se vahan chori — abhi thane mein khabar deta hoon!',
      tts: 'चोर-चोर! दिन-दहाड़े सड़क से वाहन चोरी — अभी थाने में ख़बर देता हूँ!',
    },
    {
      text: 'Video ban gaya hai bhai! Police 2 minute mein peeche padne wali hai!',
      tts: 'वीडियो बन गया है भाई! पुलिस दो मिनट में पीछे पड़ने वाली है!',
    },
  ],

  witness_call_assault: [
    {
      text: 'Bachao! Police ko phone kar raha hoon, abhi aate hain!',
      tts: 'बचाओ! पुलिस को फोन कर रहा हूँ, अभी आते हैं!',
    },
    {
      text: '100 number lagao! Yahan maar-peet ho rahi hai!',
      tts: 'सौ नंबर लगाओ! यहाँ मार-पीट हो रही है!',
    },
    {
      text: 'Haye re! Kisi ko chot pahunchayi hai isne — jaldi police aur ambulance bulao!',
      tts: 'हाय रे! किसी को चोट पहुंचाई है इसने — जल्दी पुलिस और एम्बुलेंस बुलाओ!',
    },
    {
      text: 'Hello Control Room? Is chowk par zabardast jhagda aur hamla ho raha hai!',
      tts: 'हेलो कंट्रोल रूम? इस चौक पर ज़बरदस्त झगड़ा और हमला हो रहा है!',
    },
    {
      text: 'Roko isko! Masoom aadmi par haath utha raha hai — main 100 par call kar raha hoon!',
      tts: 'रोको इसको! मासूम आदमी पर हाथ उठा रहा है — मैं सौ पर कॉल कर रहा हूँ!',
    },
    {
      text: 'Police thane mein phone lag gaya! Tu ab kahin nahi bhaag payega!',
      tts: 'पुलिस थाने में फोन लग गया! तू अब कहीं नहीं भाग पाएगा!',
    },
    {
      text: 'Gundagardi mat karo bhai! Sab log 100 dial kar rahe hain!',
      tts: 'गुंडागर्दी मत करो भाई! सब लोग सौ डायल कर रहे हैं!',
    },
    {
      text: 'Arre sahab jaldi aaiye, yahan sadak par open attack ho raha hai!',
      tts: 'अरे साहब जल्दी आइए, यहाँ सड़क पर ओपन अटैक हो रहा है!',
    },
  ],

  traffic_no_helmet: [
    {
      text: 'Oye! Bina helmet bike chalata hai? {fine} challan bharo aur helmet pehno!',
      tts: 'ओये! बिना हेलमेट बाइक चलाता है? पांच सौ रुपये चालान भरो और हेलमेट पहनो!',
    },
    {
      text: 'Side mein rok bike! Sar par helmet kahan hai? {fine} ka challan kat gaya!',
      tts: 'साइड में रोक बाइक! सर पर हेलमेट कहाँ है? पांच सौ रुपये का चालान कट गया!',
    },
    {
      text: 'Apni jaan ki parwah nahi kya? Bina helmet ride par {fine} jurmana bharo!',
      tts: 'अपनी जान की परवाह नहीं क्या? बिना हेलमेट राइड पर पांच सौ रुपये जुर्माना भरो!',
    },
    {
      text: 'Traffic niyam bhool gaya? L dabake turant helmet pehno, abhi {fine} challan jama karo!',
      tts: 'ट्रैफिक नियम भूल गया? तुरंत हेलमेट पहनो, अभी पांच सौ रुपये चालान जमा करो!',
    },
    {
      text: 'Bike ki speed dekho aur sar khali! {fine} challan raseed pakdo bhai sahab!',
      tts: 'बाइक की स्पीड देखो और सर ख़ाली! पांच सौ रुपये चालान रसीद पकड़ो भाई साहब!',
    },
    {
      text: 'Sarak suraksha mazaak nahi hai! Bina helmet {fine} fine — DM Office se helmet le lo!',
      tts: 'सड़क सुरक्षा मज़ाक नहीं है! बिना हेलमेट पांच सौ रुपये फाइन — डीएम ऑफिस से हेलमेट ले लो!',
    },
    {
      text: 'Challan kat gaya! Aage chowk par fir bina helmet mile to seedha wanted star lagega!',
      tts: 'चालान कट गया! आगे चौक पर फिर बिना हेलमेट मिले तो सीधा वॉन्टेड स्टार लगेगा!',
    },
    {
      text: 'Ruko hero! Bina helmet hawa mein mat udo, {fine} fine bharo aur helmet lagao!',
      tts: 'रुको हीरो! बिना हेलमेट हवा में मत उड़ो, पांच सौ रुपये फाइन भरो और हेलमेट लगाओ!',
    },
  ],

  traffic_no_dl: [
    {
      text: 'Ruko! Bina Driving License ke gaadi chala rahe ho? {fine} challan!',
      tts: 'रुको! बिना ड्राइविंग लाइसेंस के गाड़ी चला रहे हो? दो हज़ार रुपये चालान!',
    },
    {
      text: 'Paper check! Tumhare paas valid Driving License nahi hai — {fine} jurmana bharo!',
      tts: 'पेपर चेक! तुम्हारे पास वैध ड्राइविंग लाइसेंस नहीं है — दो हज़ार रुपये जुर्माना भरो!',
    },
    {
      text: 'DM RTO se DL banwaya nahi aur road par gaadi leke nikal pade?! {fine} fine!',
      tts: 'डीएम आरटीओ से डीएल बनवाया नहीं और रोड पर गाड़ी लेके निकल पड़े?! दो हज़ार रुपये फाइन!',
    },
    {
      text: 'Challan Book nikalo! Without Driving License driving par {fine} penalty lagu hoti hai!',
      tts: 'चालान बुक निकालो! बिना ड्राइविंग लाइसेंस के गाड़ी चलाने पर दो हज़ार रुपये पेनल्टी लागू होती है!',
    },
    {
      text: 'Gaadi side lagao! License dikhao... nahi hai? {fine} bharo aur pehle RTO test pass karo!',
      tts: 'गाड़ी साइड लगाओ! लाइसेंस दिखाओ... नहीं है? दो हज़ार रुपये भरो और पहले आरटीओ टेस्ट पास करो!',
    },
    {
      text: 'Teen baar bina DL pakde gaye to seedha FIR hogi! Abhi {fine} challan bharo.',
      tts: 'तीन बार बिना डीएल पकड़े गए तो सीधा एफआईआर होगी! अभी दो हज़ार रुपये चालान भरो।',
    },
    {
      text: 'Motor Vehicles Act ke tahat bina license gaadi chalana jurm hai — {fine} challan!',
      tts: 'मोटर व्हीकल्स एक्ट के तहत बिना लाइसेंस गाड़ी चलाना जुर्म है — दो हज़ार रुपये चालान!',
    },
    {
      text: 'Bhai sahab DL kahan hai? DM Office jaake test pass karo, filhal {fine} fine bharo!',
      tts: 'भाई साहब डीएल कहाँ है? डीएम ऑफिस जाकर टेस्ट पास करो, फिलहाल दो हज़ार रुपये फाइन भरो!',
    },
  ],

  traffic_red_light: [
    {
      text: 'Oye! Laal batti paar karta hai? Sambhal ke chala!',
      tts: 'ओये! लाल बत्ती पार करता है? संभल के चला!',
    },
    {
      text: 'Signal tod ke kahan bhaag raha hai?! Laal batti par brake lagana seekho!',
      tts: 'सिग्नल तोड़ के कहाँ भाग रहा है?! लाल बत्ती पर ब्रेक लगाना सीखो!',
    },
    {
      text: 'Traffic whistle suni nahi?! Red light jump karne par accident ho sakta hai!',
      tts: 'ट्रैफिक सीटी सुनी नहीं?! रेड लाइट जंप करने पर एक्सीडेंट हो सकता है!',
    },
    {
      text: 'Ruko! Chowk par red signal hai aur tum full speed mein nikal rahe ho?',
      tts: 'रुको! चौक पर रेड सिग्नल है और तुम फुल स्पीड में निकल रहे हो?',
    },
    {
      text: 'Andha hai kya?! Laal batti jal rahi hai, agli baar seedha police case banega!',
      tts: 'अंधा है क्या?! लाल बत्ती जल रही है, अगली बार सीधा पुलिस केस बनेगा!',
    },
    {
      text: 'Dhyan se bhai! Zebra crossing aur laal signal ki izzat karna seekho!',
      tts: 'ध्यान से भाई! ज़ेबरा क्रॉसिंग और लाल सिग्नल की इज़्ज़त करना सीखो!',
    },
    {
      text: 'Chowk camera aur meri nazar dono tum par hain — red light mat todo!',
      tts: 'चौक कैमरा और मेरी नज़र दोनों तुम पर हैं — रेड लाइट मत तोड़ो!',
    },
    {
      text: 'Aakhri warning hai signal par! Baar-baar laal batti todi to lockup jaoge!',
      tts: 'आख़िरी चेतावनी है सिग्नल पर! बार-बार लाल बत्ती तोड़ी तो लॉकअप जाओगे!',
    },
  ],

  sacred_ram_mandir: [
    {
      text: 'Jai Shree Ram! Mandir mein darshan kijiye bhai, Prabhu ki kripa sada aap par rahe.',
      tts: 'जय श्री राम! मंदिर में दर्शन कीजिए भाई, प्रभु की कृपा सदा आप पर रहे।',
    },
    {
      text: 'Siya Ram! Aaiye aarti ka samay hai, man ko shanti aur sharir ko bal milega.',
      tts: 'सिया राम! आइए आरती का समय है, मन को शांति और शरीर को बल मिलेगा।',
    },
    {
      text: 'Jai Shree Ram! Mandir parisar mein aapka swagat hai — prasad aur aashirwad grahan karein.',
      tts: 'जय श्री राम! मंदिर परिसर में आपका स्वागत है — प्रसाद और आशीर्वाद ग्रहण करें।',
    },
    {
      text: 'Prabhu Ramchandra ji aapke jeevan mein sukh, shanti aur sahas bhar dein. Jai Shree Ram!',
      tts: 'प्रभु रामचंद्र जी आपके जीवन में सुख, शांति और साहस भर दें। जय श्री राम!',
    },
    {
      text: 'Mangal Bhavan Amangal Hari! Mandir ki ghanti ki tarah aapka har kaam shubh ho.',
      tts: 'मंगल भवन अमंगल हारी! मंदिर की घंटी की तरह आपका हर काम शुभ हो।',
    },
    {
      text: 'Jai Hanuman! Jai Shree Ram! Satsang aur darshan se aapka din mangalmay ho.',
      tts: 'जय हनुमान! जय श्री राम! सत्संग और दर्शन से आपका दिन मंगलमय हो।',
    },
    {
      text: 'Aao bhakt, deep jalaiye aur Prabhu ke charnon mein shanti paaiye. Jai Shree Ram!',
      tts: 'आओ भक्त, दीप जलाइए और प्रभु के चरणों में शांति पाइए। जय श्री राम!',
    },
    {
      text: 'Shree Ram Darbar se sada satya aur dharma ke marg par chalne ka aashirwad mile.',
      tts: 'श्री राम दरबार से सदा सत्य और धर्म के मार्ग पर चलने का आशीर्वाद मिले।',
    },
  ],

  sacred_krishna_mandir: [
    {
      text: 'Radhe Radhe! Jai Shree Krishna! Aao aarti mein shaamil ho aur shanti paao.',
      tts: 'राधे राधे! जय श्री कृष्ण! आओ आरती में शामिल हो और शांति पाओ।',
    },
    {
      text: 'Hare Krishna! Govind Gopal aapki har mushkil door karein — Radhe Radhe!',
      tts: 'हरे कृष्ण! गोविंद गोपाल आपकी हर मुश्किल दूर करें — राधे राधे!',
    },
    {
      text: 'Bolo Banke Bihari Lal ki Jai! Mandir mein baithkar thodi der bhajan sun lijiye.',
      tts: 'बोलो बांके बिहारी लाल की जय! मंदिर में बैठकर थोड़ी देर भजन सुन लीजिए।',
    },
    {
      text: 'Radhe Shyam! Bansuri wale Kanha ji ki kripa se aapka har kadam safal ho.',
      tts: 'राधे श्याम! बांसुरी वाले कान्हा जी की कृपा से आपका हर कदम सफल हो।',
    },
    {
      text: 'Jai Shree Krishna! Makhan-mishri prasad lijiye aur man halka kijiye.',
      tts: 'जय श्री कृष्ण! माखन-मिश्री प्रसाद लीजिए और मन हल्का कीजिए।',
    },
    {
      text: 'Radhe Radhe bhai! Prem aur karuna ka sandesh hi Shree Krishna ki pooja hai.',
      tts: 'राधे राधे भाई! प्रेम और करुणा का संदेश ही श्री कृष्ण की पूजा है।',
    },
    {
      text: 'Om Namo Bhagavate Vasudevaya! Prabhu aapki raksha karein aur aashirwad dein.',
      tts: 'ओम नमो भगवते वासुदेवाय! प्रभु आपकी रक्षा करें और आशीर्वाद दें।',
    },
    {
      text: 'Vrindavan si shanti yahan milegi — aao Prabhu Krishna ke darshan karo. Radhe Radhe!',
      tts: 'वृंदावन सी शांति यहाँ मिलेगी — आओ प्रभु कृष्ण के दर्शन करो। राधे राधे!',
    },
  ],

  sacred_mosque: [
    {
      text: 'Walykum aslam bhai! Allah aapko hamesha salamat, sehatmand aur aman mein rakhe.',
      tts: 'वालेकुम अस्सलाम भाई! अल्लाह आपको हमेशा सलामत, सेहतमंद और अमन में रखे।',
    },
    {
      text: 'Aslam walykum! Masjid-e-Noor mein khush-aamdeed — dua mein sabki bhalai maangein.',
      tts: 'अस्सलाम वालेकुम! मस्जिद-ए-नूर में खुश-आमदीद — दुआ में सबकी भलाई मांगें।',
    },
    {
      text: 'Khuda aapko barkat aur sukoon ata farmaaye bhai. Aaiye, aman ki dua karein!',
      tts: 'खुदा आपको बरकत और सुकून अता फरमाए भाई। आइए, अमन की दुआ करें!',
    },
    {
      text: 'Aslam walykum bhaijaan! Sab khairiyat hai? Allah aapke har nek kaam mein madad kare.',
      tts: 'अस्सलाम वालेकुम भाईजान! सब ख़ैरियत है? अल्लाह आपके हर नेक काम में मदद करे।',
    },
    {
      text: 'Masjid ke sahn mein sukoon hi sukoon hai — dua qubool ho aur dil ko thandak mile.',
      tts: 'मस्जिद के सहन में सुकून ही सुकून है — दुआ क़ुबूल हो और दिल को ठंडक मिले।',
    },
    {
      text: 'Allah Hafiz aur Walykum aslam! Shahar mein bhaichara aur aman hamesha kayam rahe.',
      tts: 'अल्लाह हाफ़िज़ और वालेकुम अस्सलाम! शहर में भाईचारा और अमन हमेशा क़ायम रहे।',
    },
    {
      text: 'Juma ho ya aam din, dil se maangi dua kabhi khali nahi jaati. Salamat raho bhai!',
      tts: 'जुमा हो या आम दिन, दिल से मांगी दुआ कभी ख़ाली नहीं जाती। सलामत रहो भाई!',
    },
    {
      text: 'Rahmat aur barkat aapke ghar par barasti rahe — masjid ki taraf se dil se dua!',
      tts: 'रहमत और बरकत आपके घर पर बरसती रहे — मस्जिद की तरफ से दिल से दुआ!',
    },
  ],

  street_greet: [
    { text: 'Kaisa hai bhai? Sab badhiya chal raha hai na?', tts: 'कैसे हो भाई? सब बढ़िया चल रहा है ना?' },
    { text: 'Namaste bhai sahab! Aaj mausam bada suhana hai.', tts: 'नमस्ते भाई साहब! आज मौसम बड़ा सुहाना है।' },
    { text: 'Chal chai piyega?', tts: 'चल चाय पियेगा?' },
    { text: 'Sab thik-thak hai na? Bazaar mein aaj kaafi chahal-pahel hai.', tts: 'सब ठीक-ठाक है ना? बाज़ार में आज काफ़ी चहल-पहल है।' },
    { text: 'Ram Ram bhai! Auto-rickshaw ki sawari kaisi chal rahi hai?', tts: 'राम राम भाई! ऑटो-रिक्शा की सवारी कैसी चल रही है?' },
    { text: 'Bhai sahab, Royal Bank ke paas naya ATM dekha kya? Bada aasan ho gaya kaam.', tts: 'भाई साहब, रॉयल बैंक के पास नया एटीएम देखा क्या? बड़ा आसान हो गया काम।' },
    { text: 'Chal chai piyega?', tts: 'चल चाय पियेगा?' },
    { text: 'Suna hai DM Office mein driving test aur helmet dono mil rahe hain!', tts: 'सुना है डीएम ऑफिस में ड्राइविंग टेस्ट और हेलमेट दोनों मिल रहे हैं!' },
    { text: 'Are yaar, shaam ko golgappe khaane chalenge chowk par!', tts: 'अरे यार, शाम को गोलगप्पे खाने चलेंगे चौक पर!' },
    { text: 'Apna dhyan rakhna bhai, chowk par traffic police checking kar rahi hai.', tts: 'अपना ध्यान रखना भाई, चौक पर ट्रैफिक पुलिस चेकिंग कर रही है।' },
  ],
};

const AMBIENT_POOLS: Record<
  'court_ambient' | 'thana_ambient' | 'thana_lockup_ambient',
  AmbientActorLine[]
> = {
  court_ambient: [
    {
      speaker: 'Vakil Deshpande',
      role: 'citizen',
      seed: 851,
      text: 'Tarikh par tarikh! Chaliye Court Room Number 2 mein file pesh karte hain.',
      tts: 'तारीख पर तारीख! चलिए कोर्ट रूम नंबर दो में फाइल पेश करते हैं।',
    },
    {
      speaker: 'Court Clerk',
      role: 'clerk',
      seed: 853,
      text: 'Agle mukadme ki file number char sau do taiyaar hai sahab!',
      tts: 'अगले मुकदमे की फाइल नंबर चार सौ दो तैयार है साहब!',
    },
    {
      speaker: 'Judge (Hall 2)',
      role: 'judge',
      seed: 854,
      text: 'Order order! Gawah ke bayan register mein darj kiye jaayein!',
      tts: 'ऑर्डर ऑर्डर! गवाह के बयान रजिस्टर में दर्ज किए जाएँ!',
    },
    {
      speaker: 'Adv. Priya Nair',
      role: 'lawyer',
      seed: 852,
      text: 'Your Honour, zameeni vivad ke sabhi kagazaat court mein jama kar diye hain.',
      tts: 'योर ऑनर, ज़मीनी विवाद के सभी कागज़ात कोर्ट में जमा कर दिए हैं।',
    },
    {
      speaker: 'Adv. Rajeev Verma',
      role: 'lawyer',
      seed: 855,
      text: 'Bail application type ho gayi hai, bas Judge sahab ke signature baaki hain.',
      tts: 'बेल एप्लिकेशन टाइप हो गई है, बस जज साहब के सिग्नेचर बाकी हैं।',
    },
    {
      speaker: 'Munshi Trilok',
      role: 'clerk',
      seed: 856,
      text: 'Court Room 1 mein BNS Section 281 rash driving ki sunwai chal rahi hai!',
      tts: 'कोर्ट रूम एक में बीएनएस सेक्शन दो सौ इक्यासी रैश ड्राइविंग की सुनवाई चल रही है!',
    },
    {
      speaker: 'Judge (Hall 3)',
      role: 'judge',
      seed: 857,
      text: 'Vakil sahab, apni behas mudde par rakhein — agla case pesh kiya jaaye.',
      tts: 'वकील साहब, अपनी बहस मुद्दे पर रखें — अगला केस पेश किया जाए।',
    },
    {
      speaker: 'Gawah Harish',
      role: 'citizen',
      seed: 858,
      text: 'Main geeta par haath rakhkar kehta hoon sahab, jo kahunga sach kahunga!',
      tts: 'मैं गीता पर हाथ रखकर कहता हूँ साहब, जो कहूँगा सच कहूँगा!',
    },
    {
      speaker: 'Adv. Kavita Joshi',
      role: 'lawyer',
      seed: 859,
      text: 'Chashmdeed gawah ka cross-examination abhi 10 minute mein shuru hoga.',
      tts: 'चश्मदीद गवाह का क्रॉस-एग्जामिनेशन अभी दस मिनट में शुरू होगा।',
    },
    {
      speaker: 'Court Peshkar',
      role: 'clerk',
      seed: 860,
      text: 'Mukadma number 118 hazir ho! Sabhi vakil aur fariyadi andar aa jaayein!',
      tts: 'मुकदमा नंबर एक सौ अठारह हाज़िर हो! सभी वकील और फरियादी अंदर आ जाएँ!',
    },
  ],

  thana_ambient: [
    {
      speaker: 'Hawaldaar Ramesh',
      role: 'officer',
      seed: 702,
      text: 'Control Room Alpha-4, Thana Number 4 duty report clear — over!',
      tts: 'कंट्रोल रूम अल्फा चार, थाना नंबर चार ड्यूटी रिपोर्ट क्लियर — ओवर!',
    },
    {
      speaker: 'Fariyadi Suresh',
      role: 'citizen',
      seed: 705,
      text: 'Sahab mera scooter bazaar se chori ho gaya, jaldi FIR likh lijiye!',
      tts: 'साहब मेरा स्कूटर बाज़ार से चोरी हो गया, जल्दी एफआईआर लिख लीजिए!',
    },
    {
      speaker: 'Duty Constable',
      role: 'officer',
      seed: 703,
      text: 'Register number teen lao aur sabhi patrolling units ko alert rakho!',
      tts: 'रजिस्टर नंबर तीन लाओ और सभी पेट्रोलिंग यूनिट्स को अलर्ट रखो!',
    },
    {
      speaker: 'Munshi Mahendra',
      role: 'clerk',
      seed: 706,
      text: 'Aaj 14 naye challan aur 2 chori ki reports file mein chadhayi hain sahab.',
      tts: 'आज चौदह नए चालान और दो चोरी की रिपोर्ट्स फाइल में चढ़ाई हैं साहब।',
    },
    {
      speaker: 'Inspector Vijay',
      role: 'inspector',
      seed: 701,
      text: 'Sabhi beat officers apni radio frequency check karein — shahar mein shanti rehni chahiye.',
      tts: 'सभी बीट ऑफिसर्स अपनी रेडियो फ्रीक्वेंसी चेक करें — शहर में शांति रहनी चाहिए।',
    },
    {
      speaker: 'Fariyadi Kamla',
      role: 'citizen',
      seed: 707,
      text: 'Inspector sahab, humari gali mein raat ko tezz bike wale shor machate hain!',
      tts: 'इंस्पेक्टर साहब, हमारी गली में रात को तेज़ बाइक वाले शोर मचाते हैं!',
    },
    {
      speaker: 'Constable Tiwari',
      role: 'officer',
      seed: 708,
      text: 'Ji Inspector sahab! Court duty ke liye Prisoner Van bahar ready khadi hai.',
      tts: 'जी इंस्पेक्टर साहब! कोर्ट ड्यूटी के लिए प्रिज़नर वैन बाहर रेडी खड़ी है।',
    },
    {
      speaker: 'Wireless Desk',
      role: 'officer',
      seed: 711,
      text: 'Thana No. 4 wireless check — Royal Bank aur Chowk beat clear, over and out!',
      tts: 'थाना नंबर चार वायरलेस चेक — रॉयल बैंक और चौक बीट क्लियर, ओवर एंड आउट!',
    },
  ],

  thana_lockup_ambient: [
    {
      speaker: 'Lockup Constable',
      role: 'officer',
      seed: 709,
      text: 'Chup-chaap lockup mein baith! Zyada halla kiya toh danda padega!',
      tts: 'चुप-चाप लॉकअप में बैठ! ज़्यादा हल्ला किया तो डंडा पड़ेगा!',
    },
    {
      speaker: 'Kaidi Bunty',
      role: 'citizen',
      seed: 710,
      text: 'Sahab ek cup chai pila do, subah se lockup mein hoon!',
      tts: 'साहब एक कप चाय पिला दो, सुबह से लॉकअप में हूँ!',
    },
    {
      speaker: 'Lockup Constable',
      role: 'officer',
      seed: 712,
      text: 'Kanoon todne se pehle socha nahi? Ab court mein Judge ke saamne rona!',
      tts: 'कानून तोड़ने से पहले सोचा नहीं? अब कोर्ट में जज के सामने रोना!',
    },
    {
      speaker: 'Kaidi Pappu',
      role: 'citizen',
      seed: 713,
      text: 'Sir ji bina helmet aur laal batti par pakad liya — meri zamanat kab hogi?',
      tts: 'सर जी बिना हेलमेट और लाल बत्ती पर पकड़ लिया — मेरी ज़मानत कब होगी?',
    },
    {
      speaker: 'Constable Yadav',
      role: 'officer',
      seed: 714,
      text: 'Agli van 15 minute mein District Court jaane wali hai — dono file taiyaar rakho!',
      tts: 'अगली वैन पंद्रह मिनट में डिस्ट्रिक्ट कोर्ट जाने वाली है — दोनों फाइल तैयार रखो!',
    },
    {
      speaker: 'Kaidi Bunty',
      role: 'citizen',
      seed: 710,
      text: 'Bhai meri chhoti si galti thi, Inspector sahab ko bolo ek mauka de dein!',
      tts: 'भाई मेरी छोटी सी गलती थी, इंस्पेक्टर साहब को बोलो एक मौका दे दें!',
    },
    {
      speaker: 'Lockup Constable',
      role: 'officer',
      seed: 709,
      text: 'Saliya mat hila! Abhi poochhtaachh ke liye andar bulaunga to saari hawa nikal jayegi!',
      tts: 'सलिया मत हिला! अभी पूछताछ के लिए अंदर बुलाऊँगा तो सारी हवा निकल जाएगी!',
    },
    {
      speaker: 'Inspector Vijay',
      role: 'inspector',
      seed: 701,
      text: 'Lockup mein band sabhi aropiyon ki BNS chargesheet court bhejne ke liye sign ho gayi hai.',
      tts: 'लॉकअप में बंद सभी आरोपियों की बीएनएस चार्जशीट कोर्ट भेजने के लिए साइन हो गई है।',
    },
  ],
};
