class PriceCalculator:
    """Service to calculate component prices (50% of market price)"""
    
    @staticmethod
    def calculate_component_price(market_price: float) -> float:
        """Calculate the selling price as 50% of market price"""
        if market_price <= 0:
            raise ValueError("Market price must be greater than 0")
        return market_price * 0.5
    
    @staticmethod
    def calculate_order_total(unit_price: float, quantity: int) -> float:
        """Calculate total order price"""
        return unit_price * quantity
    
    @staticmethod
    def adjust_price_by_condition(base_price: float, condition_score: int) -> float:
        """Adjust price based on condition score (1-10)"""
        # Condition multiplier: score/10 (e.g., score 8 = 0.8)
        multiplier = condition_score / 10
        return base_price * multiplier