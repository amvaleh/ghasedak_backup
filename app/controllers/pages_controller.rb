class PagesController < ApplicationController
  
  def home
    @products = Shoppe::Product.active.featured.includes(:default_image, :product_categories, :variants).root
    # @products = Shoppe::Product.root.ordered.includes(:product_categories, :variants)
  end


  def do_search

    if params[:query].present?
      term = params[:query]
      @result = Shoppe::Product.all.where("name LIKE ? OR permalink LIKE ? OR description LIKE ? OR short_description LIKE ?","%#{term}%", "%#{term}%", "%#{term}%", "%#{term}%")
      @result2 =  Shoppe::ProductCategory.all.where("name LIKE ? OR permalink LIKE ? OR description LIKE ?","%#{term}%", "%#{term}%", "%#{term}%")
    else
      render :nothing => true
      return
    end
  end
  
end

