class PagesController < ApplicationController
  
  def home
    @products = Shoppe::Product.active.featured.includes(:default_image, :product_categories, :variants).root
    # @products = Shoppe::Product.root.ordered.includes(:product_categories, :variants)
  end
  
end

