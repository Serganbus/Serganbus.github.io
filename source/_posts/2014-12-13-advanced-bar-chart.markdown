---
layout: post
title: "Продвинутая столбиковая диаграмма с использованием D3.js"
date: 2014-12-13 23:49:49 +0600
comments: true
categories: [javascript, d3js, visualization]
---
Приветствую!
Сегодня мы поговорим об обязательных атрибутах продвинутой столбиковой диграммы и о том, как ее реализовывать с использованием библиотеки визуализации данных D3.js. В моем переводе краткого руководства уже затрагивалась тема построения столбиковой диаграммы, однако продвинутой ее назвать язык просто не поворачивается. Кто еще не читал это краткое руководство, оно находится [здесь](http://serganbus.github.io/d3tutorials/making_bar_chart.html).

Допустим, нам необходимо показать, сколько денег мы тратим каждый день в течении месяца. Логично, что для этого дела мы выбрали столбиковую диаграмму. Для начала определимся, что же из себя представляет продвинутая столбиковая диаграмма? Минимальным набором для такой диаграммы является набор столбиков, оси и метки на осях. Хорошо если диаграмма будет иметь легенду(по-русски: подпись). Еще лучше, если диаграмма будет интерактивная. Представьте: наводишь мышью на столбик, а он подсвечивается, да еще и отображается посказка, какое значение отображает этот столбик! И верхом всего будет продвинутая интерактивность. Давайте же выполним задуманное.
<!-- more -->
Делаем все по порядку. 
#### Этап 1. Простая диаграмма
Сначала реализуем диаграмму с минимальным набором. Тут расписывать нечего, так как пользуемся лишь знаниями, полученными при чтении [переведенного руководства](http://serganbus.github.io/d3tutorials/index.html).
Смотрим на [результат](http://jsfiddle.net/Serganbus/0gbjxqf2/). Сразу выявляется недочет: подписи на горизонтальной оси накладываются друг на другу, тем самым не давая себя прочитать. Если мы проанализируем в web-inspector'e, из чего состоит одна метка на оси, то увидим следующее:
{% img center /images/posts/advanced_bar_chart_1.jpg 602 172 'Web Inspector' 'Web Inspector' %}
То есть, метка состоит из линии и подписи. И подпись у нас никак не корректируется в зависимости от ширины столбика. Выглядит ужасно и очень не информативно. Чтобы это исправить, нам нужно сделать так, чтобы подпись для каждого столбика корректировалась в зависимости от ширины этого столбика.  Концептуально можно выделить такую последовательность действия для решения этой задачи:   
1. Выбираем все метки на горизонтальной оси методом [d3.selectAll()](https://github.com/mbostock/d3/wiki/Selections#d3_selectAll);   
2. Поворачиваем подпись метки на такой угол, чтобы ее ширина была соизмерима с шириной столбика;   
3. Позиционируем подпись метки так, чтобы было ясно, к какому столбику она относится;   
Для реализации пункта 1 модифицируем код создания горизонтальной оси:
{% codeblock %}
var lHorizontalAxis = chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + chartHeight + ")")
    .call(xAxis)
    .selectAll("g.tick")
    .call(tickTextWrapping, xScale.rangeBand());
{% endcodeblock %}
Теперь, как видите, я выбираю все контейнеры, хранящие метки, и для полученный выборки вызываю метод *tickTextWrapping*, в котором технически реализованы пункты 2 и 3. Код метода:
{% codeblock %}
function tickTextWrapping(aTick, aTextMaxWidth) {
    var lTickTextsWidth = 0;
    aTick.each(function (d) {
        var lTick = d3.select(this);
        lTick.select("text").remove();
        var lTextContainerInitialX = 0;
        var lTextContainerInitialY = 17;
        var lTextContainer = lTick.append("g").attr("transform", "translate(" + lTextContainerInitialX + ", " + lTextContainerInitialY + ")");
        var lText = lTextContainer.append("text").text(d).style("text-anchor", "middle");
        var lTextWidth = lText[0][0].clientWidth;
        var lTextHeight = lText[0][0].clientHeight;
        if (aTextMaxWidth/lTextWidth < 1) {
            var lTextRadian = Math.acos(aTextMaxWidth/lTextWidth) * 180 / Math.PI;
            var lTextIndent = lTextHeight / 2;
            lTextContainerInitialY -= lTextIndent;
            lText.attr("transform", "rotate(" + -lTextRadian + ")").attr("dy", lTextIndent).style("text-anchor", "middle");
            var lTextContainerWidth = -lTextWidth * Math.sin(aTextMaxWidth/lTextWidth) / 2 + lTextContainerInitialX;
            var lTextContainerHeight = lTextWidth * Math.cos(aTextMaxWidth/lTextWidth) / 2 + lTextContainerInitialY;
            lTextContainer.attr("transform", "translate(" + lTextContainerWidth + ", " + lTextContainerHeight + ")");
        }
    });
}
{% endcodeblock %}
Метод на вход принимает набор меток, а также максимально допустимую ширину метки. Кстати, внутри этого метода можно делать с метками все что душе угодно. Так что советую запомнить этот прием.   
Итак, смотрим на полученный [результат](http://jsfiddle.net/Serganbus/0gbjxqf2/1/).   
Теперь если мы добавим данные о тратах за все дни месяца, у нас все равно получится очень красивая и наглядная диаграмма. [Полученный результат](http://jsfiddle.net/Serganbus/0gbjxqf2/2/).
#### Этап 2. Добавляем легенду
Для большей информативности добавим легенду:
{% codeblock %}
var lChartCaption = "График расхода денежных средств за ноябрь 2014";
chart.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -chartMargin.top / 2)
    .style({"text-anchor": "middle", "font": "24px Courier New"})
    .text(lChartCaption);
{% endcodeblock %}
[Результат с легендой](http://jsfiddle.net/Serganbus/0gbjxqf2/3/).   
Еще приятнее и информативнее стала выглядеть наша диаграмма.
#### Этап 3. Добавляем интерактивность
Сделаем так, чтобы при наведении курсором на столбик он выделялся. Это делается простым добавлением CSS-стилей:
{% codeblock %}
svg rect.bar:hover {
    fill: #00C12B;
}
{% endcodeblock %}
[Результат](http://jsfiddle.net/Serganbus/0gbjxqf2/4/).   
Для достижения большей интерактивности сделаем так, чтобы при наведении куросором столбик не только выделялся, но и отображалась сверху подсказка со значением столбика.   
Для этого мы создаем на для каждого столбика отдельную подсказку, воспользовавшись элементом polygon:
{% codeblock %}
var labelsContainers = chart.selectAll("g.label")
    .data(dataset)
    .enter()
    .append("g")
    .attr("class", "label")
    .attr("transform", function (d) {
        var lInitialX = xScale(d.label);
        var lX = lInitialX + xScale.rangeBand() / 2;
        var lY = yScale(d.data);
        return "translate(" + lX + ", " + lY + ")";
    })
    .attr("id", function (d, i) { return "label" + i; })
    .style("display", "none");
labelsContainers.append("polygon")
    .attr("points", "0,0 -5,-10 -50,-10 -50,-50 50,-50 50,-10 5,-10");
labelsContainers.append("text")
    .attr("id", function (d, i) { return "date" + i; })
    .attr("x", "0")
    .attr("y", function (d) {
        return -35;
    })
    .style("text-anchor", "middle")
    .text(function (d) { return "Дата: " + d.label; });
labelsContainers.append("text")
    .attr("id", function (d, i) { return "value" + i; })
    .attr("x", "0")
    .attr("y", function (d) {
        return -15;
    })
    .style("text-anchor", "middle")
    .text(function (d) { return "Расходы: " + d.data; });
{% endcodeblock %}
И на каждый столбик вешаем обработчики "mouseenter" и "mouseleave", которые управляют отображением подсказок:
{% codeblock %}
	.on("mouseenter", function (d, i) {
        chart.select("#label" + i).style("display", "block");
    })
    .on("mouseleave", function (d, i) { 
        chart.select("#label" + i).style("display", "none"); 
    });
{% endcodeblock %}
Таким образом, наша продвинутая стобликовая диаграмма готова!
[Конечный результат](http://jsfiddle.net/Serganbus/0gbjxqf2/5/).