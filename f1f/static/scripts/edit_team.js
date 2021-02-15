// when the document has fully loaded: 
$(document).ready(function(){
        
    const selected_drivers = new Set();
    var total_cost = 0;

    // when a card is clicked
    $(".card").on("click", function(){
        let this_id = $(this).attr('id');
        let this_cost = $(this).children("div").children("p")[2];
        this_cost = $(this_cost).text();

        if (!selected_drivers.has(this_id) && selected_drivers.size >= 5)
            return;
            
        if (selected_drivers.has(this_id)){
            selected_drivers.delete(this_id);
            calculateCost(this_cost *= -1)
        } else {
            selected_drivers.add(this_id);
            calculateCost(this_cost)
        } 
        console.log(selected_drivers);

        $(this).toggleClass('bg-info');
    });

    $("#save-btn").on("click", function(){
        if (total_cost <= 100){
            $.post("/save_roster", 
                {
                    'drivers': JSON.stringify(Array.from(selected_drivers)),
                    'roster' : 1
                }, 
                function(_, status){
                    if (status === "success"){
                        $('#msg').html('<span style="color: green;">Saved sucessfully.</span>');
                    }
                });
        }
    });

    //update the total cost bar
    function calculateCost (change) {
        total_cost = +((total_cost + parseFloat(change)).toFixed(1));

        $("#progress-bar").attr("aria-valuenow", Math.round(total_cost));
        $("#progress-bar").attr("style", `width: ${Math.round(total_cost)}%`);
        $("#progress-bar").text(total_cost);

        if (total_cost > 100) {
            $("#progress-bar").addClass("bg-danger");
            $("#save-btn").addClass("btn-danger");
            $("#save-btn").removeClass("btn-primary");
        } else {
            $("#progress-bar").removeClass("bg-danger");
            $("#save-btn").addClass("btn-primary");
            $("#save-btn").removeClass("btn-danger");
        }
    }
    
});