## 📌 О проекте
В этом репозитории ра-змещаются этапы разработки библиотеки для платформы "ЗиС Прогноз" для сегмента элекетроэнергетика. Репозиторий посвящён разработке моделей компьютерного зрения для мониторинга объектов электросетевой инфраструктуры:  
- линии электропередачи  
- трансформаторные подстанции (КТП, БКТП)  
- элементы опор, изоляторы, разъединители, реклоузеры и другое оборудование  

Мы используем YOLOv8 (сегментация, YOLOv11,  YOLO-E, а также кастомную модель YOLO8-obb с блоками собственной разработки, и собственный размеченный датасет с **16 классами** оборудования.  

## 📂 Классы
- background  
- cabinet  
- crossarm  
- disconnector  
- foundation  
- hardware  
- insulator_glass  
- insulator_porcelain  
- lightning_arrester  
- mounting_platform  
- pole  
- recloser  
- transformer_current  
- transformer_ground  
- transformer_pole  
- transformer_voltage  

## 📸 Примеры работы модели

### Разъединитель 10 кВ
![Disconnector](https://github.com/NataGoto/powerlines/blob/main/test_disconnector_10_kv_2.jpg)

### КТП – пример 1
![KTP Example 1](https://github.com/NataGoto/powerlines/blob/main/test_ktp_test1.jpg)

### КТП – пример 2
![KTP Example 2](https://github.com/NataGoto/powerlines/blob/main/test_ktp_test2.jpg)

---

## 🚀 Планы
1. Расширение датасета (добавление новых КТП, ЛЭП и негативных примеров).  
2. Обучение объединённой модели для подстанций и линий.  
3. Детекция дефектов оборудования (изоляторов, арматуры, проводов и т.д.).  

---

✍️ Автор: [NataGoto](https://github.com/NataGoto)  
