// when the document has fully loaded: 
$(document).ready(function(){
    
    const selected_drivers = new Set();
    var total_cost = 0;

    // when a card is clicked
    $(".card").on("click", function(){
        let this_id = $(this).attr('id');
        let this_cost = $(this).children("div").children("p")[2];
        this_cost = $(this_cost).text();

        // if a sixth driver is clicked upon, do nothing
        if (!selected_drivers.has(this_id) && selected_drivers.size >= 5)
            return;
            
        // update drivers list and total cost
        if (selected_drivers.has(this_id)){
            selected_drivers.delete(this_id);
            calculateCost(this_cost *= -1)
        } else {
            selected_drivers.add(this_id);
            calculateCost(this_cost)
        } 
        console.log(selected_drivers);

        // toggle css class to visually represent
        $(this).toggleClass('bg-info');
    });

    $("#save-btn").on("click", function(){
        // post to url if the total cost is lower than 100
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
        total_cost = +((total_cost + parseFloat(change)).toFixed(1)); // toFixed shortens the decimals

        $("#progress-bar").attr("aria-valuenow", Math.round(total_cost));
        $("#progress-bar").attr("style", `width: ${Math.round(total_cost)}%`);
        $("#progress-bar").text(total_cost);

        // visual indication
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